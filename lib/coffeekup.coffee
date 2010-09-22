browser = window?
root = if browser then window else exports
coffee = if browser then CoffeeScript else require 'coffee-script'

class CoffeeKup
  @version: '0.1.2'

  @doctypes: {
    '5': '<!DOCTYPE html>'
    'xml': '<?xml version="1.0" encoding="utf-8" ?>'
    'default': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
    'transitional': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
    'strict': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">'
    'frameset': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">'
    '1.1': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
    'basic': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">'
    'mobile': '<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">'
  }

  @tags: 'a|abbr|acronym|address|applet|area|article|aside|audio|b|base|basefont|bdo|big|blockquote|body|br|button|canvas|caption|center|cite|code|col|colgroup|command|datalist|dd|del|details|dfn|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hgroup|hr|html|i|iframe|img|input|ins|keygen|kbd|label|legend|li|link|map|mark|menu|meta|meter|nav|noframes|noscript|object|ol|optgroup|option|output|p|param|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|source|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|tt|u|ul|var|video|xmp'.split '|'

  @self_closing: 'area|base|basefont|br|hr|img|input|link|meta'.split '|'

  @render: (template, options) ->
    options ?= {}
    options.cache ?= off
    
    if options?.cache is off or not @inst?
      @inst = new CoffeeKup
      switch typeof template
        when 'function'
          code = String(template)
          code = code.replace /^function \(\) \{/, ''
          code = code.replace /\n( )*\}$/, ''
        when 'string'
          code = coffee.compile String(template), {'noWrap'}
        else code = ''
      @func = Function('locals', "with(locals) {#{code}}")

    context = options?.context or {}
    locals = options?.locals or {}

    for k, v of context
      @inst[k] = v

    if locals.body?
      @inst.body = locals.body
      delete locals.body

    locals.doctype = @inst.doctype
    locals.comment = @inst.comment
    locals.text = @inst.text
    locals.tag = @inst.tag
    locals.coffeescript = @inst.coffeescript
    for t in @tags
      locals[t] = (opts...) -> @tag t, opts
  
    b = @inst.buffer = []
    @func.call @inst, locals
    b.pop() if b[b.length-1] is "\n"
    b.join ''

  text: (txt) => @buffer.push txt; null

  tag: (name, opts) =>
    @text "<#{name}"
    for o in opts
      @text @render_attrs(o) if typeof o is 'object'

    if name in CoffeeKup.self_closing
      @text ' />'
    else
      @text '>'
      for o in opts
        switch typeof o
          when 'function'
            result =  o.call(@)
            @text result.toString() if result?
          when 'string' then @text o
      @text "</#{name}>"

    @text "\n" unless @compact

    null

  render_attrs: (obj) ->
    str = ''
    for k, v of obj
      str += " #{k}=\"#{v}\""
    str

  doctype: (type) =>
    type ?= 5
    @text CoffeeKup.doctypes[type]
    @text "\n" unless @compact

  comment: (text) =>
    @text "<!--#{text}-->"

  coffeescript: (func) ->
    @script ->
      code = String(func)
      @text "(#{code})();"

root.CoffeeKup = CoffeeKup
root.version = CoffeeKup.version
root.render = (template, options) -> root.CoffeeKup.render(template, options) unless browser
