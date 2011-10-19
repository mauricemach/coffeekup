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
    if (typeof txt === 'string') __ck.buffer.push(txt);
    else if (typeof txt === 'number') __ck.buffer.push(String(txt));
  };
  h = function(txt) {
    return String(txt).replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

'''

call_bound_func = (func, bind = 'data') ->
  # function(){ <func> }.call(data)
  return ['call', ['dot', func, 'call'],
          [['name', bind]]]


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
    @line += str

  # Flush the buffered line to the array of nodes
  flush: ->
    @nodes.push @call ['string', @line]
    @line = ''

  # Wrap an ast node in a call to `text()` and add it to the array of nodes
  push: (node) ->
    if @line then @flush()
    @nodes.push @call node

  # If the parent statement ends with a semicolon and is not an argument
  # to a function, return the statements as separate nodes. Otherwise wrap them
  # in an anonymous function bound to the `data` object.
  get_nodes: ->
    if @line then @flush()

    if @parent[0] is 'stat'
      return ['splice', @nodes]

    return call_bound_func([
      'function'
      null # Anonymous function
      [] # Takes no arguments
      @nodes
    ])


exports.compile = (source, hardcoded_locals, options) ->

  ast = parser.parse hardcoded_locals + "(#{source}).call(data);"
  w = uglify.ast_walker()
  ast = w.with_walkers
    call: (expr, args) ->
      name = expr[1]

      if name is 'doctype'
        doctype = String(args[0][1])
        if doctype of coffeekup.doctypes
          code = new Code w.parent()
          code.append coffeekup.doctypes[doctype]
          return code.get_nodes()
        else
          throw new Error 'Invalid doctype'

      else if name is 'comment'
        comment = args[0]
        code = new Code w.parent()

        if comment[0] is 'string'
          code.append "<!--#{comment[1]}-->"
        else
          code.append '<!--'
          code.push comment
          code.append '-->'

        return code.get_nodes()

      else if name in coffeekup.tags or name in ['tag', 'coffeescript']
        if name is 'tag'
          name = args.shift()[1]
        if name is 'coffeescript'
          name = 'script'
          do (args) ->
            arg_types = (arg[0] for arg in args)
            if arg_types.indexOf('function') == -1
              # Check if an object has been passed to the `coffeescript`
              # function.  If so, add `type: "text/coffeescript"` to it. If
              # not, inject `{ type: "text/coffeescript" }` as an argument to
              # the `coffeescript` function.
              obj_index = arg_types.indexOf('object')
              if obj_index == -1
                args.push ['object', [['type', ['string', 'text/coffeescript']]]]
              else
                args[obj_index][1].push ['type', ['string', 'text/coffeescript']]

        code = new Code w.parent()
        code.append "<#{name}"

        # Iterate over the arguments to the tag function and build the tag html
        # as calls to the `text()` function.
        for arg in args
          switch arg[0]

            when 'function'
              # If this is a `<script>` tag, stringify the function
              if name is 'script'
                contents = [
                  'string'
                  uglify.gen_code ['stat', call_bound_func(arg, 'this')],
                    beautify: true
                    indent_level: 2
                ]
              # Otherwise recursively check for tag functions and inject the
              # result as a bound function call
              else
                contents = call_bound_func(w.walk arg)

            when 'object'
              for attr in arg[1]
                key = attr[0]
                value = attr[1]

                # If `value` is a simple string, include it in the same call to
                # `text` as the tag
                if value[0] is 'string'
                  code.append " #{key}=\"#{value[1]}\""

                # Otherwise put it in a separate tag
                else
                  code.append " #{key}=\""
                  code.push value
                  code.append '"'

            else
              # id class string: `"#id.class1.class2"`. Note that this compiler
              # only supports simple string values: if you need to determine
              # this tag's id or class dynamically, pass the value in an object
              # e.g. `div id: "id", class: "class1 class2"`
              if arg[0] is 'string' and args.length > 1 and arg is args[0] and name != 'script'
                classes = []

                for i in arg[1].split '.'
                  if '#' in i
                    id = i.replace '#', ''
                  else
                    classes.push i unless i is ''

                code.append " id=\"#{id}\"" if id

                if classes.length > 0
                  code.append " class=\"#{classes.join ' '}\""

              # For everything else, put into the template function as is. Note
              # that the `text()` function in the template skeleton will only
              # output strings and numbers.
              else
                contents = arg

        if name in coffeekup.self_closing
          code.append '/>'
        else
          code.append '>'
    
        code.push contents if contents?
        if not (name in coffeekup.self_closing)
          code.append "</#{name}>"

        return code.get_nodes()

      # Return the node as-is if this is not a call to a tag function
      return [this[0], w.walk(expr), uglify.MAP(args, w.walk)]
    , ->
      return w.walk ast

  compiled = uglify.gen_code ast,
    beautify: true
    indent_level: 2

  # Main function assembly.
  code = skeleton + compiled + "return __ck.buffer.join('');"

  return new Function 'data', code

