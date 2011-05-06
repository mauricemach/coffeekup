if window?
  coffeekup = window.CoffeeKup = {}
  coffee = if CoffeeScript? then CoffeeScript else null
else
  coffeekup = exports
  coffee = require 'coffee-script'

coffeekup.version = '0.2.3'

skeleton = (ck_options = {}) ->
  ck_options.context ?= {}
  ck_options.locals ?= {}
  ck_options.format ?= off
  ck_options.autoescape ?= off
  ck_buffer = []

  ck_render_attrs = (obj) ->
    str = ''
    for k, v of obj
      str += " #{k}=\"#{ck_esc(v)}\""
    str

  ck_doctypes =
    '5': '<!DOCTYPE html>'
    'xml': '<?xml version="1.0" encoding="utf-8" ?>'
    'default': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
    'transitional': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
    'strict': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">'
    'frameset': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">'
    '1.1': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
    'basic': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">'
    'mobile': '<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">'

  ck_self_closing = ['area', 'base', 'basefont', 'br', 'col', 'frame', 'hr', 'img', 'input', 'link', 'meta', 'param']

  ck_esc = (txt) ->
    if ck_options.autoescape then h(txt) else String(txt)

  ck_tabs = 0

  ck_repeat = (string, count) -> Array(count + 1).join string

  ck_indent = -> text ck_repeat('  ', ck_tabs) if ck_options.format

  h = (txt) ->
    String(txt).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    
  doctype = (type = 5) ->
    text ck_doctypes[type]
    text '\n' if ck_options.format
    
  text = (txt) ->
    ck_buffer.push String(txt)
    null

  comment = (cmt) ->
    text "<!--#{cmt}-->"
    text '\n' if ck_options.format
  
  tag = -> name = arguments[0]; delete arguments[0]; ck_tag(name, arguments)

  ck_tag = (name, opts) ->
    ck_indent()
    text "<#{name}"
  
    for o in opts
      text ck_render_attrs(o) if typeof o is 'object'
  
    if name in ck_self_closing
      text ' />'
      text '\n' if ck_options.format
    else
      text '>'
  
      for o in opts
        switch typeof o
          when 'string', 'number'
            text ck_esc(o)
          when 'function'
            text '\n' if ck_options.format
            ck_tabs++
            result = o.call ck_options.context
            if typeof result is 'string'
              ck_indent()
              text ck_esc(result)
              text '\n' if ck_options.format
            ck_tabs--
            ck_indent()
      text "</#{name}>"
      text '\n' if ck_options.format
  
    null
  
  coffeescript = (code) ->
    script ";(#{code})();"

  null

support = '''
  var __slice = Array.prototype.slice;
  var __hasProp = Object.prototype.hasOwnProperty;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  var __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype;
    return child;
  };
  var __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  };
'''

skeleton = String(skeleton).replace(/function\s*\(ck_options\)\s*\{/, '').replace /return null;\s*\}$/, ''
skeleton = support + skeleton

tags = 'a|abbr|acronym|address|applet|area|article|aside|audio|b|base|basefont|bdo|big|blockquote|body|br|button|canvas|caption|center|cite|code|col|colgroup|command|datalist|dd|del|details|dfn|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hgroup|hr|html|i|iframe|img|input|ins|keygen|kbd|label|legend|li|link|map|mark|menu|meta|meter|nav|noframes|noscript|object|ol|optgroup|option|output|p|param|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|source|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|tt|u|ul|video|xmp'.split '|'

coffeekup.compile = (template, options = {}) ->
  options.locals ?= {}

  # Shim for express.
  if options.locals.body?
    options.context.body = options.locals.body
    delete options.locals.body

  if options.body?
    options.context.body = options.body
    delete options.body

  
  if typeof template is 'function' then template = String(template)
  else if typeof template is 'string' and coffee?
    template = coffee.compile template, bare: yes
    template = "function(){#{template}}"
  
  tags_here = []
  for t in tags
    if template.indexOf(t) > -1
      tags_here.push t

  code = skeleton + "var #{tags_here.join ','};"
  for t in tags_here
    code += "#{t} = function(){return ck_tag('#{t}', arguments)};"
  
  for k, v of options.locals
    if typeof v is 'function' then code += "var #{k} = #{v};"
    else code += "var #{k} = #{JSON.stringify v};"
  
  code += 'with(ck_options.locals){' if options.dynamic_locals
  code += "(#{template}).call(ck_options.context);"
  code += '}' if options.dynamic_locals
  code += "return ck_buffer.join('');"

  new Function('ck_options', code)

cache = {}
coffeekup.render = (template, options = {}) ->
  options.context ?= {}
  options.locals ?= {}
  options.cache ?= on


  if options.cache and cache[template]? then tpl = cache[template]
  else if options.cache then tpl = cache[template] = coffeekup.compile(template, options)
  else tpl = coffeekup.compile(template, options)
  tpl(options)

unless window?
  coffeekup.adapters =
    simple: (template, data) -> coffeekup.render template, context: data
  coffeekup.adapters.meryl = coffeekup.adapters.simple
