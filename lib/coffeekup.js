(function() {
  var cache, coffee, coffeekup, skeleton, support, tags;
  var __hasProp = Object.prototype.hasOwnProperty, __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  };
  if (typeof window != "undefined" && window !== null) {
    coffeekup = window.CoffeeKup = {};
    coffee = typeof CoffeeScript != "undefined" && CoffeeScript !== null ? CoffeeScript : null;
  } else {
    coffeekup = exports;
    coffee = require('coffee-script');
  }
  coffeekup.version = '0.2.1';
  skeleton = function(ck_options) {
    var ck_buffer, ck_doctypes, ck_esc, ck_indent, ck_render_attrs, ck_repeat, ck_self_closing, ck_tabs, ck_tag, coffeescript, comment, doctype, h, tag, text, _ref, _ref2, _ref3, _ref4;
    ck_options != null ? ck_options : ck_options = {};
    (_ref = ck_options.context) != null ? _ref : ck_options.context = {};
    (_ref2 = ck_options.locals) != null ? _ref2 : ck_options.locals = {};
    (_ref3 = ck_options.format) != null ? _ref3 : ck_options.format = false;
    (_ref4 = ck_options.autoescape) != null ? _ref4 : ck_options.autoescape = false;
    ck_buffer = [];
    ck_render_attrs = function(obj) {
      var k, str, v;
      str = '';
      for (k in obj) {
        if (!__hasProp.call(obj, k)) continue;
        v = obj[k];
        str += " " + k + "=\"" + (ck_esc(v)) + "\"";
      }
      return str;
    };
    ck_doctypes = {
      '5': '<!DOCTYPE html>',
      'xml': '<?xml version="1.0" encoding="utf-8" ?>',
      'default': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
      'transitional': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
      'strict': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
      'frameset': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">',
      '1.1': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
      'basic': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">',
      'mobile': '<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">'
    };
    ck_self_closing = ['area', 'base', 'basefont', 'br', 'hr', 'img', 'input', 'link', 'meta'];
    ck_esc = function(txt) {
      if (ck_options.autoescape) {
        return h(txt);
      } else {
        return String(txt);
      }
    };
    ck_tabs = 0;
    ck_repeat = function(string, count) {
      return Array(count + 1).join(string);
    };
    ck_indent = function() {
      if (ck_options.format) {
        return text(ck_repeat('  ', ck_tabs));
      }
    };
    h = function(txt) {
      return String(txt).replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };
    doctype = function(type) {
      type != null ? type : type = 5;
      text(ck_doctypes[type]);
      if (ck_options.format) {
        return text('\n');
      }
    };
    text = function(txt) {
      ck_buffer.push(String(txt));
      return null;
    };
    comment = function(cmt) {
      text("<!--" + cmt + "-->");
      if (ck_options.format) {
        return text('\n');
      }
    };
    tag = function() {
      var name;
      name = arguments[0];
      delete arguments[0];
      return ck_tag(name, arguments);
    };
    ck_tag = function(name, opts) {
      var o, result, _i, _j, _len, _len2;
      ck_indent();
      text("<" + name);
      for (_i = 0, _len = opts.length; _i < _len; _i++) {
        o = opts[_i];
        if (typeof o === 'object') {
          text(ck_render_attrs(o));
        }
      }
      if (__indexOf.call(ck_self_closing, name) >= 0) {
        text(' />');
        if (ck_options.format) {
          text('\n');
        }
      } else {
        text('>');
        for (_j = 0, _len2 = opts.length; _j < _len2; _j++) {
          o = opts[_j];
          switch (typeof o) {
            case 'string':
            case 'number':
              text(ck_esc(o));
              break;
            case 'function':
              if (ck_options.format) {
                text('\n');
              }
              ck_tabs++;
              result = o.call(ck_options.context);
              if (typeof result === 'string') {
                ck_indent();
                text(ck_esc(result));
                if (ck_options.format) {
                  text('\n');
                }
              }
              ck_tabs--;
              ck_indent();
          }
        }
        text("</" + name + ">");
        if (ck_options.format) {
          text('\n');
        }
      }
      return null;
    };
    coffeescript = function(code) {
      return script(";(" + code + ")();");
    };
    return null;
  };
  support = 'var __slice = Array.prototype.slice;\nvar __hasProp = Object.prototype.hasOwnProperty;\nvar __indexOf = Array.prototype.indexOf || function(item) {\n  for (var i = 0, l = this.length; i < l; i++) {if (this[i] === item) return i;}; return -1;};\nvar __bind = function(fn, me){return function(){return fn.apply(me, arguments);};};\nvar __extends = function(child, parent) {\n  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }\n  function ctor() { this.constructor = child; }\n  ctor.prototype = parent.prototype; child.prototype = new ctor;\n  child.__super__ = parent.prototype; return child;\n};';
  skeleton = String(skeleton).replace(/function\s*\(ck_options\)\s*\{/, '').replace(/return null;\s*\}$/, '');
  skeleton = support + skeleton;
  tags = 'a|abbr|acronym|address|applet|area|article|aside|audio|b|base|basefont|bdo|big|blockquote|body|br|button|canvas|caption|center|cite|code|col|colgroup|command|datalist|dd|del|details|dfn|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hgroup|hr|html|i|iframe|img|input|ins|keygen|kbd|label|legend|li|link|map|mark|menu|meta|meter|nav|noframes|noscript|object|ol|optgroup|option|output|p|param|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|source|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|tt|u|ul|video|xmp'.split('|');
  coffeekup.compile = function(template, options) {
    var code, k, t, tags_here, v, _i, _j, _len, _len2, _ref, _ref2;
    options != null ? options : options = {};
    (_ref = options.locals) != null ? _ref : options.locals = {};
    if (typeof template === 'function') {
      template = String(template);
    } else if (typeof template === 'string' && (coffee != null)) {
      template = coffee.compile(template, {
        bare: true
      });
      template = "function(){" + template + "}";
    }
    tags_here = [];
    for (_i = 0, _len = tags.length; _i < _len; _i++) {
      t = tags[_i];
      if (template.indexOf(t) > -1) {
        tags_here.push(t);
      }
    }
    code = skeleton + ("var " + (tags_here.join(',')) + ";");
    for (_j = 0, _len2 = tags_here.length; _j < _len2; _j++) {
      t = tags_here[_j];
      code += "" + t + " = function(){return ck_tag('" + t + "', arguments)};";
    }
    _ref2 = options.locals;
    for (k in _ref2) {
      if (!__hasProp.call(_ref2, k)) continue;
      v = _ref2[k];
      if (typeof v === 'function') {
        code += "var " + k + " = " + v + ";";
      } else {
        code += "var " + k + " = " + (JSON.stringify(v)) + ";";
      }
    }
    if (options.dynamic_locals) {
      code += 'with(ck_options.locals){';
    }
    code += "(" + template + ").call(ck_options.context);";
    if (options.dynamic_locals) {
      code += '}';
    }
    code += "return ck_buffer.join('');";
    return new Function('ck_options', code);
  };
  cache = {};
  coffeekup.render = function(template, options) {
    var tpl, _ref, _ref2, _ref3;
    options != null ? options : options = {};
    (_ref = options.context) != null ? _ref : options.context = {};
    (_ref2 = options.locals) != null ? _ref2 : options.locals = {};
    (_ref3 = options.cache) != null ? _ref3 : options.cache = true;
    if (options.locals.body != null) {
      options.context.body = options.locals.body;
      delete options.locals.body;
    }
    if (options.cache && (cache[template] != null)) {
      tpl = cache[template];
    } else if (options.cache) {
      tpl = cache[template] = coffeekup.compile(template, options);
    } else {
      tpl = coffeekup.compile(template, options);
    }
    return tpl(options);
  };
  if (typeof window == "undefined" || window === null) {
    coffeekup.adapters = {
      simple: function(template, data) {
        return coffeekup.render(template, {
          context: data
        });
      }
    };
    coffeekup.adapters.meryl = coffeekup.adapters.simple;
  }
}).call(this);
