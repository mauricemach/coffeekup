(function() {
  var CoffeeKup, _i, _len, _ref, cached, coffee, doctypes, locals, render, self_closing, tags, unwrap, version;
  var __hasProp = Object.prototype.hasOwnProperty;
  version = '0.1.6';
  if (typeof window !== "undefined" && window !== null) {
    coffee = (typeof CoffeeScript !== "undefined" && CoffeeScript !== null) ? CoffeeScript : null;
  } else {
    coffee = require('coffee-script');
  }
  doctypes = {
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
  tags = 'a|abbr|acronym|address|applet|area|article|aside|audio|b|base|basefont|bdo|big|blockquote|body|br|button|canvas|caption|center|cite|code|col|colgroup|command|datalist|dd|del|details|dfn|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hgroup|hr|html|i|iframe|img|input|ins|keygen|kbd|label|legend|li|link|map|mark|menu|meta|meter|nav|noframes|noscript|object|ol|optgroup|option|output|p|param|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|source|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|tt|u|ul|video|xmp'.split('|');
  self_closing = 'area|base|basefont|br|hr|img|input|link|meta'.split('|');
  unwrap = function(code) {
    code = String(code);
    if (code.search(/^(\s)*function/ > -1)) {
      code = code.replace(/^(\s)*function(\s)*\(\)(\s)*\{/, '');
      return (code = code.replace(/\}(\s)*$/, ''));
    }
  };
  locals = {
    render_attrs: function(obj) {
      var _ref, k, str, v;
      str = '';
      _ref = obj;
      for (k in _ref) {
        if (!__hasProp.call(_ref, k)) continue;
        v = _ref[k];
        str += (" " + (k) + "=\"" + (v) + "\"");
      }
      return str;
    },
    doctype: function(type) {
      type = (typeof type !== "undefined" && type !== null) ? type : 5;
      return this.text(doctypes[type]);
    },
    comment: function(cmt) {
      return this.text("<!--" + (cmt) + "-->");
    },
    tag: function(name, opts) {
      var _i, _len, _ref, o, result, t;
      this.text("<" + (name));
      _ref = opts;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        o = _ref[_i];
        if (typeof o === 'object') {
          this.text(this.render_attrs(o));
        }
      }
      if ((function(){ for (var _i=0, _len=self_closing.length; _i<_len; _i++) { if (self_closing[_i] === name) return true; } return false; }).call(this)) {
        this.text(' />');
      } else {
        this.text('>');
        _ref = opts;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          o = _ref[_i];
          t = typeof o;
          if (t === 'function') {
            result = o.call(this.context);
            if (typeof result === 'string') {
              this.text(result);
            }
          } else if (t === 'string' || t === 'number') {
            this.text(o);
          }
        }
        this.text("</" + (name) + ">");
      }
      return null;
    },
    coffeescript: function(code) {
      return this.script(";(" + (code) + ")();");
    }
  };
  _ref = tags;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    (function() {
      var t = _ref[_i];
      return (locals[t] = function() {
        return this.tag(t, arguments);
      });
    })();
  }
  cached = {};
  render = function(template, options) {
    var _ref2, buffer, code, scoped_template;
    options = (typeof options !== "undefined" && options !== null) ? options : {};
    options.cache = (typeof options.cache !== "undefined" && options.cache !== null) ? options.cache : true;
    buffer = [];
    locals.text = function(txt) {
      buffer.push(String(txt));
      return null;
    };
    locals.context = options.context || {};
    if (options.cache && (typeof (_ref2 = cached[template]) !== "undefined" && _ref2 !== null)) {
      scoped_template = cached[template];
    } else {
      switch (typeof template) {
        case 'string':
          if (typeof coffee !== "undefined" && coffee !== null) {
            code = coffee.compile(template, {
              'noWrap': 'noWrap'
            });
          } else {
            code = unwrap(template);
          }
          break;
        case 'function':
          code = unwrap(template);
          break;
        default:
          code = '';
      }
      scoped_template = new Function('locals', "with(locals){" + (code) + "}");
      if (options.cache) {
        cached[template] = scoped_template;
      }
    }
    scoped_template.call(locals.context, locals);
    if (buffer[buffer.length - 1] === "\n") {
      buffer.pop();
    }
    return buffer.join('');
  };
  CoffeeKup = {
    version: version,
    render: render
  };
  if (typeof window !== "undefined" && window !== null) {
    window.CoffeeKup = CoffeeKup;
  } else {
    exports.version = CoffeeKup.version;
    exports.render = CoffeeKup.render;
    exports.adapters = {
      simple: function(template, data) {
        return render(template, {
          context: data
        });
      }
    };
    exports.adapters.meryl = exports.adapters.simple;
  }
}).call(this);
