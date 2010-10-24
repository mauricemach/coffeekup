version = '0.1.6'

if window?
  coffee = if CoffeeScript? then CoffeeScript else null
else coffee = require 'coffee-script'

doctypes =
  '5': '<!DOCTYPE html>'
  'xml': '<?xml version="1.0" encoding="utf-8" ?>'
  'default': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
  'transitional': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
  'strict': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">'
  'frameset': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">'
  '1.1': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
  'basic': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">'
  'mobile': '<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">'
tags = 'a|abbr|acronym|address|applet|area|article|aside|audio|b|base|basefont|bdo|big|blockquote|body|br|button|canvas|caption|center|cite|code|col|colgroup|command|datalist|dd|del|details|dfn|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hgroup|hr|html|i|iframe|img|input|ins|keygen|kbd|label|legend|li|link|map|mark|menu|meta|meter|nav|noframes|noscript|object|ol|optgroup|option|output|p|param|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|source|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|tt|u|ul|video|xmp'.split '|'
self_closing = 'area|base|basefont|br|hr|img|input|link|meta'.split '|'

unwrap = (code) ->
  code = String(code)
  if code.search /^(\s)*function/ > -1
    code = code.replace /^(\s)*function(\s)*\(\)(\s)*\{/, ''
    code = code.replace /\}(\s)*$/, ''

locals =
  render_attrs: (obj) ->
    str = ''
    for k, v of obj
      str += " #{k}=\"#{v}\""
    str

  doctype: (type) ->
    type ?= 5
    @text doctypes[type]

  comment: (cmt) ->
    @text "<!--#{cmt}-->"

  tag: (name, opts) ->
    @text "<#{name}"
    for o in opts
      @text @render_attrs(o) if typeof o is 'object'

    if name in self_closing
      @text ' />'
    else
      @text '>'
      for o in opts
        t = typeof o
        if t is 'function'
          result = o.call context
          @text result if typeof result is 'string'
        else if t is 'string' or t is 'number' then @text o
      @text "</#{name}>"

    null

  coffeescript: (code) ->
    @script ";(#{code})();"

for t in tags
  locals[t] = -> @tag t, arguments

cached = {}
context = {}

render = (template, options) ->
  options ?= {}
  options.context ?= {}
  options.locals ?= {}
  options.cache ?= on

  buffer = []
  locals.text = (txt) -> buffer.push String(txt); null
  context = options.context

  if options.locals.body?
    context.body = options.locals.body
    delete options.locals.body

  if options.cache and cached[template]?
    scoped_template = cached[template]
  else
    switch typeof template
      when 'string'
        if coffee? then code = coffee.compile template, {'noWrap'}
        else code = unwrap(template)
      when 'function' then code = unwrap(template)
      else code = ''

    scoped_template = new Function('locals', "with(locals){#{code}}")
    cached[template] = scoped_template if options.cache

  scoped_template.call context, locals
  buffer.pop() if buffer[buffer.length-1] is "\n"
  buffer.join ''

CoffeeKup = version: version, render: render

if window? then window.CoffeeKup = CoffeeKup
else
  exports.version = CoffeeKup.version
  exports.render = CoffeeKup.render
  exports.adapters =
    simple: (template, data) -> render template, context: data
  exports.adapters.meryl = exports.adapters.simple
