(function() {
  var CoffeeKup, browser, coffee, root;
  var __hasProp = Object.prototype.hasOwnProperty;
  browser = (typeof window !== "undefined" && window !== null);
  root = browser ? window : exports;
  if (browser) {
    coffee = (typeof CoffeeScript !== "undefined" && CoffeeScript !== null) ? CoffeeScript : null;
  } else {
    coffee = require('coffee-script');
  }
  CoffeeKup = function() {};
  CoffeeKup.version = '0.1.6';
  CoffeeKup.doctypes = {
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
  CoffeeKup.tags = 'a|abbr|acronym|address|applet|area|article|aside|audio|b|base|basefont|bdo|big|blockquote|body|br|button|canvas|caption|center|cite|code|col|colgroup|command|datalist|dd|del|details|dfn|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hgroup|hr|html|i|iframe|img|input|ins|keygen|kbd|label|legend|li|link|map|mark|menu|meta|meter|nav|noframes|noscript|object|ol|optgroup|option|output|p|param|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|source|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|tt|u|ul|video|xmp'.split('|');
  CoffeeKup.self_closing = 'area|base|basefont|br|hr|img|input|link|meta'.split('|');
  CoffeeKup.unwrap = function(code) {
    code = String(code);
    if (code.search(/^(\s)*function/ > -1)) {
      code = code.replace(/^(\s)*function(\s)*\(\)(\s)*\{/, '');
      return (code = code.replace(/\}(\s)*$/, ''));
    }
  };
  CoffeeKup.cache = {};
  CoffeeKup.render = function(template, options) {
    var _i, _len, _ref, buffer, code, coffeescript, comment, context, doctype, locals, render_attrs, scoped_template, tag, text, vars;
    options = (typeof options !== "undefined" && options !== null) ? options : {};
    options.cache = (typeof options.cache !== "undefined" && options.cache !== null) ? options.cache : false;
    options.compact = (typeof options.compact !== "undefined" && options.compact !== null) ? options.compact : false;
    buffer = [];
    context = options.context || {};
    locals = options.locals || {};
    if (typeof (_ref = locals.body) !== "undefined" && _ref !== null) {
      context.body = locals.body;
      delete locals.body;
    }
    text = function(txt) {
      buffer.push(txt);
      return null;
    };
    render_attrs = function(obj) {
      var _ref2, k, str, v;
      str = '';
      _ref2 = obj;
      for (k in _ref2) {
        if (!__hasProp.call(_ref2, k)) continue;
        v = _ref2[k];
        str += (" " + (k) + "=\"" + (v) + "\"");
      }
      return str;
    };
    doctype = function(type) {
      type = (typeof type !== "undefined" && type !== null) ? type : 5;
      text(CoffeeKup.doctypes[type]);
      if (!(options.compact)) {
        return text("\n");
      }
    };
    comment = function(cmt) {
      return text("<!--" + (cmt) + "-->");
    };
    tag = function(name, opts) {
      var _i, _len, _ref2, o, result;
      text("<" + (name));
      _ref2 = opts;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        o = _ref2[_i];
        if (typeof o === 'object') {
          text(render_attrs(o));
        }
      }
      if ((function(){ for (var _i=0, _len=(_ref2 = CoffeeKup.self_closing).length; _i<_len; _i++) { if (_ref2[_i] === name) return true; } return false; }).call(this)) {
        text(' />');
      } else {
        text('>');
        _ref2 = opts;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          o = _ref2[_i];
          switch (typeof o) {
            case 'function':
              result = o.call(context);
              if (typeof result === 'string') {
                text(result);
              }
              break;
            case 'string':
              text(o);
              break;
          }
        }
        text("</" + (name) + ">");
      }
      if (!(options.compact)) {
        text("\n");
      }
      return null;
    };
    coffeescript = function(code) {
      return tag('script', "(" + (code) + ")();");
    };
    locals.text = text;
    locals.render_attrs = render_attrs;
    locals.doctype = doctype;
    locals.comment = comment;
    locals.tag = tag;
    locals.coffeescript = coffeescript;
    _ref = this.tags;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      (function() {
        var t = _ref[_i];
        return (locals[t] = function() {
          return tag(t, arguments);
        });
      })();
    }
    if (options.cache && (typeof (_ref = this.cache[template]) !== "undefined" && _ref !== null)) {
      scoped_template = this.cache[template];
    } else {
      switch (typeof template) {
        case 'function':
          code = this.unwrap(template);
          break;
        case 'string':
          if (typeof coffee !== "undefined" && coffee !== null) {
            code = coffee.compile(String(template), {
              'noWrap': 'noWrap'
            });
          } else {
            code = this.unwrap(template);
          }
          break;
        default:
          code = '';
      }
      vars = [];
      for(k in locals) {vars.push('var ' + k + ' = locals.' + k + ';')};
      scoped_template = new Function('locals', (vars.join('')) + code);
      if (options.cache) {
        this.cache[template] = scoped_template;
      }
    }
    scoped_template.call(context, locals);
    if (buffer[buffer.length - 1] === "\n") {
      buffer.pop();
    }
    return buffer.join('');
  };
  root.CoffeeKup = CoffeeKup;
  root.version = CoffeeKup.version;
  if (!(browser)) {
    root.render = function(template, options) {
      return CoffeeKup.render(template, options);
    };
    root.adapters = {};
    root.adapters.simple = function(template, data) {
      return CoffeeKup.render(template, {
        context: data
      });
    };
    root.adapters.meryl = root.adapters.simple;
  }
}).call(this);
