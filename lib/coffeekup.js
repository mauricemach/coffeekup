(function() {
  var CoffeeKup, browser, coffee, root;
  var __hasProp = Object.prototype.hasOwnProperty, __slice = Array.prototype.slice;
  browser = (typeof window !== "undefined" && window !== null);
  root = browser ? window : exports;
  if (browser) {
    coffee = (typeof CoffeeScript !== "undefined" && CoffeeScript !== null) ? CoffeeScript : null;
  } else {
    coffee = require('coffee-script');
  }
  CoffeeKup = function() {
    var _this;
    _this = this;
    this.comment = function(){ return CoffeeKup.prototype.comment.apply(_this, arguments); };
    this.doctype = function(){ return CoffeeKup.prototype.doctype.apply(_this, arguments); };
    this.tag = function(){ return CoffeeKup.prototype.tag.apply(_this, arguments); };
    this.text = function(){ return CoffeeKup.prototype.text.apply(_this, arguments); };
    return this;
  };
  CoffeeKup.version = '0.1.4';
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
  CoffeeKup.tags = 'a|abbr|acronym|address|applet|area|article|aside|audio|b|base|basefont|bdo|big|blockquote|body|br|button|canvas|caption|center|cite|code|col|colgroup|command|datalist|dd|del|details|dfn|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hgroup|hr|html|i|iframe|img|input|ins|keygen|kbd|label|legend|li|link|map|mark|menu|meta|meter|nav|noframes|noscript|object|ol|optgroup|option|output|p|param|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|source|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|tt|u|ul|var|video|xmp'.split('|');
  CoffeeKup.self_closing = 'area|base|basefont|br|hr|img|input|link|meta'.split('|');
  CoffeeKup.unwrap = function(code) {
    code = String(code);
    if (code.search(/^(\s)*function/ > -1)) {
      code = code.replace(/^(\s)*function(\s)*\(\)(\s)*\{/, '');
      return (code = code.replace(/\}(\s)*$/, ''));
    }
  };
  CoffeeKup.render = function(template, options) {
    var _i, _len, _ref, b, code, context, k, locals, v;
    options = (typeof options !== "undefined" && options !== null) ? options : {};
    options.cache = (typeof options.cache !== "undefined" && options.cache !== null) ? options.cache : false;
    if (options.cache === false || !(typeof (_ref = this.inst) !== "undefined" && _ref !== null)) {
      this.inst = new CoffeeKup();
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
      this.func = Function('locals', "with(locals) {" + (code) + "}");
    }
    context = options.context || {};
    locals = options.locals || {};
    _ref = context;
    for (k in _ref) {
      if (!__hasProp.call(_ref, k)) continue;
      v = _ref[k];
      this.inst[k] = v;
    }
    if (typeof (_ref = locals.body) !== "undefined" && _ref !== null) {
      this.inst.body = locals.body;
      delete locals.body;
    }
    locals.doctype = this.inst.doctype;
    locals.comment = this.inst.comment;
    locals.text = this.inst.text;
    locals.tag = this.inst.tag;
    locals.coffeescript = this.inst.coffeescript;
    _ref = this.tags;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      (function() {
        var t = _ref[_i];
        return (locals[t] = function() {
          var opts;
          opts = __slice.call(arguments, 0);
          return this.tag(t, opts);
        });
      })();
    }
    b = (this.inst.buffer = []);
    this.func.call(this.inst, locals);
    if (b[b.length - 1] === "\n") {
      b.pop();
    }
    return b.join('');
  };
  CoffeeKup.prototype.text = function(txt) {
    this.buffer.push(txt);
    return null;
  };
  CoffeeKup.prototype.tag = function(name, opts) {
    var _i, _len, _ref, o, result;
    this.text("<" + (name));
    _ref = opts;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      o = _ref[_i];
      if (typeof o === 'object') {
        this.text(this.render_attrs(o));
      }
    }
    if ((function(){ for (var _i=0, _len=(_ref = CoffeeKup.self_closing).length; _i<_len; _i++) { if (_ref[_i] === name) return true; } return false; }).call(this)) {
      this.text(' />');
    } else {
      this.text('>');
      _ref = opts;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        o = _ref[_i];
        switch (typeof o) {
          case 'function':
            result = o.call(this);
            if (typeof result === 'string') {
              this.text(result);
            }
            break;
          case 'string':
            this.text(o);
            break;
        }
      }
      this.text("</" + (name) + ">");
    }
    if (!(this.compact)) {
      this.text("\n");
    }
    return null;
  };
  CoffeeKup.prototype.render_attrs = function(obj) {
    var _ref, k, str, v;
    str = '';
    _ref = obj;
    for (k in _ref) {
      if (!__hasProp.call(_ref, k)) continue;
      v = _ref[k];
      str += (" " + (k) + "=\"" + (v) + "\"");
    }
    return str;
  };
  CoffeeKup.prototype.doctype = function(type) {
    type = (typeof type !== "undefined" && type !== null) ? type : 5;
    this.text(CoffeeKup.doctypes[type]);
    if (!(this.compact)) {
      return this.text("\n");
    }
  };
  CoffeeKup.prototype.comment = function(text) {
    return this.text("<!--" + (text) + "-->");
  };
  CoffeeKup.prototype.coffeescript = function(func) {
    return this.script(function() {
      var code;
      code = String(func);
      return this.text("(" + (code) + ")();");
    });
  };
  root.CoffeeKup = CoffeeKup;
  root.version = CoffeeKup.version;
  root.render = function(template, options) {
    if (!(browser)) {
      return root.CoffeeKup.render(template, options);
    }
  };
}).call(this);
