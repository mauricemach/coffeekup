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
  };

'''

call_bound_func = (func) ->
  return [
    'call'
    [
      'dot'
      func
      'call'
    ]
    [
      [
        'name'
        'data'
      ]
    ]
  ]

# Returns the first ast node for the given expression
parse_expr = (expr) ->
  return parser.parse(expr)[1][0]

exports.compile = (source, hardcoded_locals, options) ->

  ast = parser.parse source
  w = uglify.ast_walker()
  ast = w.with_walkers
    call: (expr, args) ->
      tag = expr[1]
      if tag in coffeekup.tags
        code = "'<#{tag}"
        for arg in args
          switch arg[0]
            when 'function'
              contents = arg
            when 'object'
              for attr in arg[1]
                key = attr[0]
                value = uglify.gen_code attr[1]
                code += " #{key}=\"' + #{value} + '\""
        if tag in coffeekup.self_closing
          code += "/>'"
        else
          code += ">'"
    
        tagopen = "text(#{code});\n"
        if not (tag in coffeekup.self_closing)
          tagclose = "text('</#{tag}>');\n"

        funcbody = [
          parse_expr tagopen
          [
            'stat'
            [
              'call'
              [
                'name'
                'text'
              ]
              [call_bound_func(w.walk contents)]
            ]
          ]
        ]
        if tagclose?
          funcbody.push parse_expr tagclose

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
  code = hardcoded_locals + skeleton + compiled
  code += "return __ck.buffer.join('');"

  return new Function 'data', code

