coffee = require 'coffee-script'
{uglify, parser} = require 'uglify-js'
coffeekup = null

# Call this from the main script so that the compiler module can have access to
# coffeekup exports (node does not allow circular imports).
exports.setup = (ck) ->
  coffeekup = ck

skeleton = '''
  __ck = {
    buffer: []
  };
  text = function(txt) {
    if (typeof txt === 'string' || txt instanceof String) {
      __ck.buffer.push(txt);
    } else if (typeof txt === 'number' || txt instanceof Number || Array.isArray(txt)) {
      __ck.buffer.push(String(txt));
    }
  };
  h = function(txt) {
    var escaped;
    if (typeof txt === 'string' || txt instanceof String) {
      escaped = txt.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    } else {
      escaped = txt;
    }
    return escaped;
  };
  yield = function(f) {
    var temp_buffer = [];
    var old_buffer = __ck.buffer;
    __ck.buffer = temp_buffer;
    f();
    __ck.buffer = old_buffer;
    return temp_buffer.join('');
  };

'''

call_bound_func = (func) ->
  # function(){ <func> }.call(data)
  return ['call', ['dot', func, 'call'],
          [['name', 'data']]]

# Represents compiled javascript code to be written to the template function.
class Code
  constructor: (parent) ->
    @parent = parent
    @nodes = []
    @line = ''

  # Returns the ast node for `text(<arg>);`
  call: (arg) ->
    return ['stat', ['call', ['name', 'text'], [arg]]]

  # Add `str` to the current line to be written
  append: (str) ->
    if @block?
      @block.append str
    else
      @line += str

  # Flush the buffered line to the array of nodes
  flush: ->
    if @block?
      @block.flush()
    else
      @nodes.push @call ['string', @line]
      @line = ''

  # Wrap subsequent calls to `text()` in an if block
  open_if: (condition) ->
    @flush()
    if @block?
      @block.open_if condition
    else
      @block = new Code()
      @block.condition = condition

  # Close an if block
  close_if: ->
    @flush()
    if @block.block?
      @block.close_if()
    else
      @nodes.push ['if', @block.condition, ['block', @block.nodes]]
      delete @block

  # Wrap an ast node in a call to `text()` and add it to the array of nodes
  push: (node) ->
    @flush()
    if @block?
      @block.push node
    else
      @nodes.push @call node

  # If the parent statement ends with a semicolon and is not an argument
  # to a function, return the statements as separate nodes. Otherwise wrap them
  # in an anonymous function bound to the `data` object.
  get_nodes: ->
    @flush()

    if @parent[0] is 'stat'
      return ['splice', @nodes]

    return call_bound_func([
      'function'
      null # Anonymous function
      [] # Takes no arguments
      @nodes
    ])


exports.compile = (source, hardcoded_locals, options) ->

  escape = (node) ->
    if options.autoescape
      # h(<node>)
      return ['call', ['name', 'h'], [node]]
    return node

  ast = parser.parse hardcoded_locals + "(#{source}).call(data);"
  w = uglify.ast_walker()
  ast = w.with_walkers
    call: (expr, args) ->
      name = expr[1]

      if name is 'doctype'
        code = new Code w.parent()
        if args.length > 0
          doctype = String(args[0][1])
          if doctype of coffeekup.doctypes
            code.append coffeekup.doctypes[doctype]
          else
            throw new Error 'Invalid doctype'
        else
          code.append coffeekup.doctypes.default
        return code.get_nodes()

      else if name is 'comment'
        comment = args[0]
        code = new Code w.parent()
        if comment[0] is 'string'
          code.append "<!--#{comment[1]}-->"
        else
          code.append '<!--'
          code.push escape comment
          code.append '-->'
        return code.get_nodes()

      else if name is 'ie'
        [condition, contents] = args
        code = new Code w.parent()
        if condition[0] is 'string'
          code.append "<!--[if #{condition[1]}]>"
        else
          code.append '<!--[if '
          code.push escape condition
          code.append ']>'
        code.push call_bound_func(w.walk contents)
        code.append '<![endif]-->'
        return code.get_nodes()

      else if name in coffeekup.tags or name in ['tag', 'coffeescript']
        if name is 'tag'
          name = args.shift()[1]

        # Compile coffeescript strings to js
        if name is 'coffeescript'
          name = 'script'
          for arg in args
            # Dynamically generated coffeescript not supported
            if arg[0] not in ['string', 'object', 'function']
              throw new Error 'Invalid argument to coffeescript function'
            # Make sure this isn't an id class string, and compile it to js
            if arg[0] is 'string' and (args.length is 1 or arg isnt args[0])
              arg[1] = coffee.compile arg[1], bare: yes

        code = new Code w.parent()
        code.append "<#{name}"

        # Iterate over the arguments to the tag function and build the tag html
        # as calls to the `text()` function.
        for arg in args
          switch arg[0]

            when 'function'
              # If this is a `<script>` tag, stringify the function
              if name is 'script'
                func = uglify.gen_code arg,
                    beautify: true
                    indent_level: 2
                contents = ['string', "#{func}.call(this);"]
              # Otherwise recursively check for tag functions and inject the
              # result as a bound function call, escaping return values if necessary
              else
                func = w.walk arg

                # Escape return values unless they are hardcoded strings
                for node, idx in func[3]
                  if node[0] is 'return' and node[1]? and node[1][0] != 'string'
                    func[3][idx][1] = escape node[1]

                contents = call_bound_func(func)

            when 'object'
              render_attrs = (obj, prefix = '') ->
                for attr in obj
                  key = attr[0]
                  value = attr[1]

                  # `true` is rendered as `selected="selected"`.
                  if value[0] is 'name' and value[1] is 'true'
                    code.append " #{key}=\"#{key}\""

                  # Do not render boolean false values
                  else if value[0] is 'name' and value[1] in ['undefined', 'null', 'false']
                    continue

                  # Wrap variables in a conditional block to make sure they are set
                  else if value[0] in ['name', 'dot']
                    varname = uglify.gen_code value
                    # Here we write the `if` condition in js and parse it, as
                    # writing the nodes manually is tedious and hard to read
                    condition = "typeof #{varname} !== 'undefined' && #{varname} !== null && #{varname} !== false"
                    code.open_if parser.parse(condition)[1][0][1] # Strip 'toplevel' and 'stat' labels
                    code.append " #{prefix + key}=\""
                    code.push escape value
                    code.append '"'
                    code.close_if()

                  # If `value` is a simple string, include it in the same call to
                  # `text` as the tag
                  else if value[0] is 'string'
                    code.append " #{prefix + key}=\"#{value[1]}\""

                  # Functions are prerendered as text
                  else if value[0] is 'function'
                    func = uglify.gen_code(value).replace(/"/g, '&quot;')
                    code.append " #{prefix + key}=\"#{func}.call(this);\""

                  # Prefixed attribute
                  else if value[0] is 'object'
                    # `data: {icon: 'foo'}` is rendered as `data-icon="foo"`.
                    render_attrs value[1], prefix + key + '-'

                  else
                    code.append " #{prefix + key}=\""
                    code.push escape value
                    code.append '"'

              render_attrs arg[1]

            when 'string'
              # id class string: `"#id.class1.class2"`. Note that this compiler
              # only supports hardcoded string values: if you need to determine
              # this tag's id or class dynamically, pass the value in an object
              # e.g. `div id: @getId(), class: getClasses()`
              if args.length > 1 and arg is args[0]
                classes = []

                for i in arg[1].split '.'
                  if '#' in i
                    id = i.replace '#', ''
                  else
                    classes.push i unless i is ''

                code.append " id=\"#{id}\"" if id

                if classes.length > 0
                  code.append " class=\"#{classes.join ' '}\""

              # Hardcoded string, escape and render it.
              else
                arg[1] = arg[1].replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                contents = arg

            # A concatenated string e.g. `"id-" + @id`
            when 'binary'

              # Traverse the ast nodes, selectively escaping anything other
              # than hardcoded strings and calls to `yield`.
              escape_all = (node) ->
                switch node[0]
                  when 'binary'
                    node[2] = escape_all node[2]
                    node[3] = escape_all node[3]
                    return node
                  when 'string'
                    return node
                  when 'call'
                    if node[1][0] is 'name' and node[1][1] is 'yield'
                      return node
                    return escape node
                  else
                    return escape node

              contents = escape_all w.walk arg

            # For everything else, put into the template function as is. Note
            # that the `text()` function in the template skeleton will only
            # output strings and numbers.
            else
              contents = escape w.walk arg

        if name in coffeekup.self_closing
          code.append ' />'
        else
          code.append '>'
    
        code.push contents if contents?
        if not (name in coffeekup.self_closing)
          code.append "</#{name}>"

        return code.get_nodes()

      # Return the node as-is if this is not a call to a tag function
      return null
    , ->
      return w.walk ast

  compiled = uglify.gen_code ast,
    beautify: true
    indent_level: 2

  # Main function assembly.
  if options.locals
    compiled = "with(data.locals){#{compiled}}"
  code = skeleton + compiled + "return __ck.buffer.join('');"

  return new Function 'data', code

