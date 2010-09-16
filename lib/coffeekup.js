(function() {
  var CoffeeKup, browser, coffee, root;
  var __hasProp = Object.prototype.hasOwnProperty, __slice = Array.prototype.slice;
  browser = (typeof window !== "undefined" && window !== null);
  root = browser ? window : exports;
  coffee = browser ? CoffeeScript : require('coffee-script');
  CoffeeKup = function() {
    var _a;
    _a = this;
    this.comment = function(){ return CoffeeKup.prototype.comment.apply(_a, arguments); };
    this.doctype = function(){ return CoffeeKup.prototype.doctype.apply(_a, arguments); };
    this.tag = function(){ return CoffeeKup.prototype.tag.apply(_a, arguments); };
    this.text = function(){ return CoffeeKup.prototype.text.apply(_a, arguments); };
    return this;
  };
  CoffeeKup.version = '0.1.1';
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
  CoffeeKup.render = function(template, options) {
    var _a, _b, _c, _d, _e, context, fn, k, locals, str, v;
    str = String(template);
    if (((typeof options === "undefined" || options === null) ? undefined : options.cache) === true) {
      this.inst = (typeof this.inst !== "undefined" && this.inst !== null) ? this.inst : new CoffeeKup();
      if (typeof template === 'function') {
        this.js = (typeof this.js !== "undefined" && this.js !== null) ? this.js : (String(template) + '();');
      } else {
        this.js = (typeof this.js !== "undefined" && this.js !== null) ? this.js : coffee.compile(String(template), {
          'noWrap': 'noWrap'
        });
      }
    } else {
      this.inst = new CoffeeKup();
      if (typeof template === 'function') {
        this.js = '(' + String(template) + ')();';
      } else {
        this.js = coffee.compile(String(template), {
          'noWrap': 'noWrap'
        });
      }
    }
    context = ((typeof options === "undefined" || options === null) ? undefined : options.context) || {};
    locals = ((typeof options === "undefined" || options === null) ? undefined : options.locals) || {};
    _a = context;
    for (k in _a) {
      if (!__hasProp.call(_a, k)) continue;
      v = _a[k];
      this.inst[k] = v;
    }
    if (typeof (_b = locals.body) !== "undefined" && _b !== null) {
      this.inst.body = locals.body;
      delete locals.body;
    }
    locals.doctype = this.inst.doctype;
    locals.comment = this.inst.comment;
    locals.text = this.inst.text;
    locals.tag = this.inst.tag;
    locals.coffeescript = this.inst.coffeescript;
    _d = this.tags;
    for (_c = 0, _e = _d.length; _c < _e; _c++) {
      (function() {
        var t = _d[_c];
        return (locals[t] = function() {
          var opts;
          opts = __slice.call(arguments, 0);
          return this.tag(t, opts);
        });
      })();
    }
    this.inst.buffer = [];
    fn = Function('locals', "with(locals) {" + (this.js) + "}");
    fn.call(this.inst, locals);
    if (this.inst.buffer[this.inst.buffer.length - 1] === "\n") {
      this.inst.buffer.pop();
    }
    return this.inst.buffer.join('');
  };
  CoffeeKup.prototype.text = function(txt) {
    this.buffer.push(txt);
    return null;
  };
  CoffeeKup.prototype.tag = function(name, opts) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, o, result;
    this.text("<" + (name));
    _b = opts;
    for (_a = 0, _c = _b.length; _a < _c; _a++) {
      o = _b[_a];
      if (typeof o === 'object') {
        this.text(this.render_attrs(o));
      }
    }
    if ((function(){ for (var _e=0, _f=(_d = CoffeeKup.self_closing).length; _e<_f; _e++) { if (_d[_e] === name) return true; } return false; }).call(this)) {
      this.text(' />');
    } else {
      this.text('>');
      _h = opts;
      for (_g = 0, _i = _h.length; _g < _i; _g++) {
        o = _h[_g];
        switch (typeof o) {
        case 'function':
          result = o.call(this);
          if (typeof result !== "undefined" && result !== null) {
            this.text(result.toString());
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
    var _a, k, str, v;
    str = '';
    _a = obj;
    for (k in _a) {
      if (!__hasProp.call(_a, k)) continue;
      v = _a[k];
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
      code = code.replace(/^function \(\) \{\n( )*return /, '');
      code = code.replace(/\n( )*\}$/, '');
      return this.text(code);
    });
  };
  root.CoffeeKup = CoffeeKup;
  root.version = CoffeeKup.version;
  root.render = function(template, options) {
    if (!(browser)) {
      return root.CoffeeKup.render(template, options);
    }
  };
})();
