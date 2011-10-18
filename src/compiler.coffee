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

call_bound_func = (func) ->
  # function(){ <func> }.call(data)
  return ['call', ['dot', func, 'call'],
          [['name', 'data']]]

# Returns the first ast node for the given expression
parse_expr = (expr) ->
  return parser.parse(expr)[1][0]

exports.compile = (source, hardcoded_locals, options) ->

  ast = parser.parse hardcoded_locals + "(#{source}).call(data);"
  w = uglify.ast_walker()
  ast = w.with_walkers
    call: (expr, args) ->
      name = expr[1]

      if name is 'doctype'
        if args.length is 1 and String(args[0][1]) of coffeekup.doctypes
          return ['call', ['name', 'text'],
                  [['string', coffeekup.doctypes[String(args[0][1])]]]]
        else
          throw new Error 'Invalid doctype'

      else if name in coffeekup.tags
        code = "'<#{name}"

        for arg in args
          switch arg[0]
            when 'function'
              contents = call_bound_func(w.walk arg)
            when 'object'
              for attr in arg[1]
                key = attr[0]
                value = uglify.gen_code attr[1]
                code += " #{key}=\"' + #{value} + '\""
            else
              if arg[0] is 'string' and args.length > 1 and arg is args[0]
                classes = []

                for i in arg[1].split '.'
                  if '#' in i
                    id = i.replace '#', ''
                  else
                    classes.push i unless i is ''

                code += " id=\"#{id}\"" if id

                if classes.length > 0
                  code += " class=\"#{classes.join ' '}\""
              else
                contents = arg

        if name in coffeekup.self_closing
          code += "/>'"
        else
          code += ">'"
    
        tagopen = "text(#{code});\n"
        if not (name in coffeekup.self_closing)
          tagclose = "text('</#{name}>');\n"

        funcbody = [parse_expr tagopen]
        if contents?
          # text(<contents>);
          funcbody.push ['stat', ['call', ['name', 'text'], [contents]]]
        if tagclose?
          funcbody.push parse_expr tagclose

        # If this function call ends with a semicolon and is not an argument to
        # a function, unwrap it from its function wrapper.
        if w.parent()[0] is 'stat'
          return ['splice', funcbody]

        # Otherwise bind it to `data`
        return call_bound_func([
          'function'
          null # Anonymous function
          [] # Takes no arguments
          funcbody
        ])

      return [this[0], w.walk(expr), uglify.MAP(args, w.walk)]
    , ->
      return w.walk ast

  compiled = uglify.gen_code ast,
    beautify: true
    indent_level: 2

  # Main function assembly.
  code = skeleton + compiled + "return __ck.buffer.join('');"

  return new Function 'data', code

