# **CoffeeKup** lets you to write HTML templates in 100% pure
# [CoffeeScript](http://coffeescript.org).
# 
# You can run it on [node.js](http://nodejs.org) or the browser, or compile your
# templates down to self-contained javascript functions, that will take in data
# and options and return generated HTML on any JS runtime.
# 
# The concept is directly stolen from the amazing
# [Markaby](http://markaby.rubyforge.org/) by Tim Fletcher and why the lucky
# stiff.

if window?
  coffeekup = window.CoffeeKup = {}
  coffee = if CoffeeScript? then CoffeeScript else null
else
  coffeekup = exports
  coffee = require 'coffee-script'

coffeekup.version = '0.3.0beta3'

# Values available to the `doctype` function inside a template.
# Ex.: `doctype 'strict'`
coffeekup.doctypes =
  'default': '<!DOCTYPE html>'
  '5': '<!DOCTYPE html>'
  'xml': '<?xml version="1.0" encoding="utf-8" ?>'
  'transitional': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
  'strict': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">'
  'frameset': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">'
  '1.1': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
  'basic': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">'
  'mobile': '<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">'
  'ce': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "ce-html-1.0-transitional.dtd">'

# CoffeeScript-generated JavaScript may contain anyone of these; but when we
# take a function to string form to manipulate it, and then recreate it through
# the `Function()` constructor, it loses access to its parent scope and
# consequently to any helpers it might need. So we need to reintroduce these
# inside any "rewritten" function.
coffeescript_helpers = """
  var __slice = Array.prototype.slice;
  var __hasProp = Object.prototype.hasOwnProperty;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  var __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype;
    return child; };
  var __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    } return -1; };
""".replace /\n/g, ''

# All possible HTML tags, from all versions (hopefully). But only those
# referenced in the template will be included in the compiled function.
coffeekup.tags = 'a|abbr|acronym|address|applet|area|article|aside|audio|b|base|basefont
|bdo|big|blockquote|body|br|button|canvas|caption|center|cite|code|col|colgroup
|command|datalist|dd|del|details|dfn|dir|div|dl|dt|em|embed|fieldset|figcaption
|figure|font|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hgroup|hr
|html|i|iframe|img|input|ins|keygen|kbd|label|legend|li|link|map|mark|menu|meta
|meter|nav|noframes|noscript|object|ol|optgroup|option|output|p|param|pre
|progress|q|rp|rt|ruby|s|samp|script|section|select|small|source|span|strike
|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title
|tr|tt|u|ul|video|xmp'.replace(/\n/g, '').split '|'

coffeekup.self_closing = ['area', 'base', 'basefont', 'br', 'col', 'frame', 'hr',
  'img', 'input', 'link', 'meta', 'param']

# This is the basic material from which compiled templates will be formed.
# It will be manipulated in its string form at the `coffeekup.compile` function
# to generate the final template function. 
skeleton = (data = {}) ->
  # Whether to generate formatted HTML with indentation and line breaks, or
  # just the natural "faux-minified" output.
  data.format ?= off

  # Whether to autoescape all content or let you handle it on a case by case
  # basis with the `h` function.
  data.autoescape ?= off

  # Internal CoffeeKup stuff.
  __ck =
    buffer: []
      
    esc: (txt) ->
      if data.autoescape then h(txt) else String(txt)

    tabs: 0

    repeat: (string, count) -> Array(count + 1).join string

    indent: -> text @repeat('  ', @tabs) if data.format

    # Adapter to keep the builtin tag functions DRY.
    tag: (name, args) ->
      combo = [name]
      combo.push i for i in args
      tag.apply data, combo

    render_idclass: (str) ->
      classes = []
        
      for i in str.split '.'
        if i.indexOf('#') is 0
          id = i.replace '#', ''
        else
          classes.push i unless i is ''
            
      text " id=\"#{id}\"" if id
      
      if classes.length > 0
        text " class=\""
        for c in classes
          text ' ' unless c is classes[0]
          text c
        text '"'

    render_attrs: (obj) ->
      for k, v of obj
        # true is rendered as `selected="selected"`.
        if typeof v is 'boolean' and v
          v = k
        # undefined, false and null result in the attribute not being rendered.
        if v
          # strings, numbers, objects, arrays and functions are rendered "as is".
          text " #{k}=\"#{@esc(v)}\""

    render_contents: (contents) ->
      switch typeof contents
        when 'string', 'number', 'boolean'
          text @esc(contents)
        when 'function'
          text '\n' if data.format
          @tabs++
          result = contents.call data
          if typeof result is 'string'
            @indent()
            text @esc(result)
            text '\n' if data.format
          @tabs--
          @indent()

    render_tag: (name, idclass, attrs, contents) ->
      @indent()
    
      text "<#{name}"
      @render_idclass(idclass) if idclass
      @render_attrs(attrs) if attrs
  
      if name in @self_closing
        text ' />'
        text '\n' if data.format
      else
        text '>'
  
        @render_contents(contents)

        text "</#{name}>"
        text '\n' if data.format
  
      null

  tag = (name, args...) ->
    for a in args
      switch typeof a
        when 'function'
          contents = a
        when 'object'
          attrs = a
        when 'number', 'boolean'
          contents = a
        when 'string'
          if args.length is 1
            contents = a
          else
            if a is args[0]
              idclass = a
            else
              contents = a

    __ck.render_tag(name, idclass, attrs, contents)

  h = (txt) ->
    String(txt).replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
    
  doctype = (type = 'default') ->
    text __ck.doctypes[type]
    text '\n' if data.format
    
  text = (txt) ->
    __ck.buffer.push String(txt)
    null

  comment = (cmt) ->
    text "<!--#{cmt}-->"
    text '\n' if data.format
  
  coffeescript = (param) ->
    switch typeof param
      # `coffeescript -> alert 'hi'` becomes:
      # `<script>;(function () {return alert('hi');})();</script>`
      when 'function'
        script "#{__ck.coffeescript_helpers}(#{param}).call(this);"
      # `coffeescript "alert 'hi'"` becomes:
      # `<script type="text/coffeescript">alert 'hi'</script>`
      when 'string'
        script type: 'text/coffeescript', -> param
      # `coffeescript src: 'script.coffee'` becomes:
      # `<script type="text/coffeescript" src="script.coffee"></script>`
      when 'object'
        param.type = 'text/coffeescript'
        script param
  
  # Conditional IE comments.
  ie = (condition, contents) ->
    __ck.indent()
    
    text "<!--[if #{condition}]>"
    __ck.render_contents(contents)
    text "<![endif]-->"
    text '\n' if data.format

  null

# Stringify the skeleton and unwrap it from its enclosing `function(){}`, then
# add the CoffeeScript helpers.
skeleton = String(skeleton)
  .replace(/function\s*\(.*\)\s*\{/, '')
  .replace(/return null;\s*\}$/, '')

skeleton = coffeescript_helpers + skeleton

# Compiles a template into a standalone JavaScript function.
coffeekup.compile = (template, options = {}) ->
  # The template can be provided as either a function or a CoffeeScript string
  # (in the latter case, the CoffeeScript compiler must be available).
  if typeof template is 'function' then template = String(template)
  else if typeof template is 'string' and coffee?
    template = coffee.compile template, bare: yes
    template = "function(){#{template}}"

  # If an object `hardcode` is provided, insert the stringified value
  # of each variable directly in the function body. This is a less flexible but
  # faster alternative to the standard method of using `with` (see below). 
  hardcoded_locals = ''
  
  if options.hardcode
    for k, v of options.hardcode
      if typeof v is 'function'
        # Make sure these functions have access to `data` as `@/this`.
        hardcoded_locals += "var #{k} = function(){return (#{v}).apply(data, arguments);};"
      else hardcoded_locals += "var #{k} = #{JSON.stringify v};"

  # Add a function for each tag this template references. We don't want to have
  # all hundred-odd tags wasting space in the compiled function.
  tag_functions = ''
  tags_used = []
  
  for t in coffeekup.tags
    if template.indexOf(t) > -1 or hardcoded_locals.indexOf(t) > -1
      tags_used.push t
      
  tag_functions += "var #{tags_used.join ','};"
  for t in tags_used
    tag_functions += "#{t} = function(){return __ck.tag('#{t}', arguments);};"

  # Main function assembly.
  code = tag_functions + hardcoded_locals + skeleton

  code += "__ck.doctypes = #{JSON.stringify coffeekup.doctypes};"
  code += "__ck.coffeescript_helpers = #{JSON.stringify coffeescript_helpers};"
  code += "__ck.self_closing = #{JSON.stringify coffeekup.self_closing};"

  # If `locals` is set, wrap the template inside a `with` block. This is the
  # most flexible but slower approach to specifying local variables.
  code += 'with(data.locals){' if options.locals
  code += "(#{template}).call(data);"
  code += '}' if options.locals
  code += "return __ck.buffer.join('');"

  new Function('data', code)

cache = {}

# Template in, HTML out. Accepts functions or strings as does `coffeekup.compile`.
# 
# Accepts an option `cache`, by default `false`. If set to `false` templates will
# be recompiled each time.
# 
# `options` is just a convenience parameter to pass options separately from the
# data, but the two will be merged and passed down to the compiler (which uses
# `locals` and `hardcode`), and the template (which understands `locals`, `format`
# and `autoescape`).
coffeekup.render = (template, data = {}, options = {}) ->
  data[k] = v for k, v of options
  data.cache ?= off

  if data.cache and cache[template]? then tpl = cache[template]
  else if data.cache then tpl = cache[template] = coffeekup.compile(template, data)
  else tpl = coffeekup.compile(template, data)
  tpl(data)

unless window?
  coffeekup.adapters =
    # Legacy adapters for when CoffeeKup expected data in the `context` attribute.
    simple: coffeekup.render
    meryl: coffeekup.render
    
    # Allows `partial 'foo'` instead of `text @partial 'foo'`.
    express:
      compile: (template, data) -> 
        data.hardcode ?= {}
        data.hardcode.partial = ->
            text @partial.apply @, arguments
        coffeekup.compile(template, data)
