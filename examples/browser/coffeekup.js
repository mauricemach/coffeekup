(function() {
  var cache, coffee, coffeekup, skeleton, support, tags;
  var __hasProp = Object.prototype.hasOwnProperty;
  if (typeof window !== "undefined" && window !== null) {
    coffeekup = (window.CoffeeKup = {});
    coffee = (typeof CoffeeScript !== "undefined" && CoffeeScript !== null) ? CoffeeScript : null;
  } else {
    coffeekup = exports;
    coffee = require('coffee-script');
  }
  coffeekup.version = '0.1.7';
  skeleton = function(ck_options) {
    var ck_buffer, ck_doctypes, ck_esc, ck_indent, ck_render_attrs, ck_repeat, ck_self_closing, ck_tabs, coffeescript, comment, doctype, h, tag, text;
    ck_options = (typeof ck_options !== "undefined" && ck_options !== null) ? ck_options : {};
    ck_options.context = (typeof ck_options.context !== "undefined" && ck_options.context !== null) ? ck_options.context : {};
    ck_options.locals = (typeof ck_options.locals !== "undefined" && ck_options.locals !== null) ? ck_options.locals : {};
    ck_options.format = (typeof ck_options.format !== "undefined" && ck_options.format !== null) ? ck_options.format : false;
    ck_options.autoescape = (typeof ck_options.autoescape !== "undefined" && ck_options.autoescape !== null) ? ck_options.autoescape : false;
    ck_buffer = [];
    ck_render_attrs = function(obj) {
      var _ref, k, str, v;
      str = '';
      _ref = obj;
      for (k in _ref) {
        if (!__hasProp.call(_ref, k)) continue;
        v = _ref[k];
        str += (" " + (k) + "=\"" + (ck_esc(v)) + "\"");
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
      return ck_options.autoescape ? h(txt) : String(txt);
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
      type = (typeof type !== "undefined" && type !== null) ? type : 5;
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
      text("<!--" + (cmt) + "-->");
      if (ck_options.format) {
        return text('\n');
      }
    };
    tag = function(name, opts) {
      var _i, _len, _ref, o, result;
      ck_indent();
      text("<" + (name));
      _ref = opts;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        o = _ref[_i];
        if (typeof o === 'object') {
          text(ck_render_attrs(o));
        }
      }
      if ((function(){ for (var _i=0, _len=ck_self_closing.length; _i<_len; _i++) { if (ck_self_closing[_i] === name) return true; } return false; }).call(this)) {
        text(' />');
        if (ck_options.format) {
          text('\n');
        }
      } else {
        text('>');
        _ref = opts;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          o = _ref[_i];
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
              break;
          }
        }
        text("</" + (name) + ">");
        if (ck_options.format) {
          text('\n');
        }
      }
      return null;
    };
    coffeescript = function(code) {
      return script(";(" + (code) + ")();");
    };
    return null;
  };
  support = 'var __slice = Array.prototype.slice;\nvar __hasProp = Object.prototype.hasOwnProperty;\nvar __bind = function(func, context) {return function(){ return func.apply(context, arguments); };};';
  skeleton = String(skeleton).replace('function (ck_options) {', '').replace(/return null;\s*\}$/, '');
  skeleton = support + skeleton;
  tags = 'a|abbr|acronym|address|applet|area|article|aside|audio|b|base|basefont|bdo|big|blockquote|body|br|button|canvas|caption|center|cite|code|col|colgroup|command|datalist|dd|del|details|dfn|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hgroup|hr|html|i|iframe|img|input|ins|keygen|kbd|label|legend|li|link|map|mark|menu|meta|meter|nav|noframes|noscript|object|ol|optgroup|option|output|p|param|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|source|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|tt|u|ul|video|xmp'.split('|');
  coffeekup.compile = function(template, options) {
    var _i, _len, _ref, code, k, t, tags_here, v;
    options = (typeof options !== "undefined" && options !== null) ? options : {};
    options.locals = (typeof options.locals !== "undefined" && options.locals !== null) ? options.locals : {};
    if (typeof template === 'function') {
      template = String(template);
    } else if (typeof template === 'string' && (typeof coffee !== "undefined" && coffee !== null)) {
      template = coffee.compile(template, {
        'noWrap': 'noWrap'
      });
      template = ("function(){" + (template) + "}");
    }
    tags_here = [];
    _ref = tags;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      t = _ref[_i];
      if (template.indexOf(t) > -1) {
        tags_here.push(t);
      }
    }
    code = skeleton.replace(', text;', ", text, " + (tags_here.join(',')) + ";");
    _ref = tags_here;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      t = _ref[_i];
      code += ("" + (t) + " = function(){return tag('" + (t) + "', arguments)};");
    }
    _ref = options.locals;
    for (k in _ref) {
      if (!__hasProp.call(_ref, k)) continue;
      v = _ref[k];
      if (typeof v === 'function') {
        code += ("var " + (k) + " = " + (v) + ";");
      } else {
        code += ("var " + (k) + " = " + (JSON.stringify(v)) + ";");
      }
    }
    if (options.dynamic_locals) {
      code += 'with(ck_options.locals){';
    }
    code += ("(" + (template) + ").call(ck_options.context);");
    if (options.dynamic_locals) {
      code += '}';
    }
    code += "return ck_buffer.join('');";
    return new Function('ck_options', code);
  };
  cache = {};
  coffeekup.render = function(template, options) {
    var _ref, tpl;
    options = (typeof options !== "undefined" && options !== null) ? options : {};
    options.context = (typeof options.context !== "undefined" && options.context !== null) ? options.context : {};
    options.locals = (typeof options.locals !== "undefined" && options.locals !== null) ? options.locals : {};
    options.cache = (typeof options.cache !== "undefined" && options.cache !== null) ? options.cache : true;
    if (typeof (_ref = options.locals.body) !== "undefined" && _ref !== null) {
      options.context.body = options.locals.body;
      delete options.locals.body;
    }
    if (options.cache && (typeof (_ref = cache[template]) !== "undefined" && _ref !== null)) {
      tpl = cache[template];
    } else if (options.cache) {
      tpl = (cache[template] = coffeekup.compile(template, options));
    } else {
      tpl = coffeekup.compile(template, options);
    }
    return tpl(options);
  };
  if (!(typeof window !== "undefined" && window !== null)) {
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
