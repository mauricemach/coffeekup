function template(ck_options) {
var __slice = Array.prototype.slice;
var __hasProp = Object.prototype.hasOwnProperty;
var __bind = function(func, context) {return function(){ return func.apply(context, arguments); };};
    var ck_buffer, ck_doctypes, ck_esc, ck_indent, ck_render_attrs, ck_repeat, ck_self_closing, ck_tabs, ck_tag, coffeescript, comment, doctype, h, tag, text, a,i,li,p,s,th,u,ul;
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
    tag = function() {
      var name;
      name = arguments[0];
      delete arguments[0];
      return ck_tag(name, arguments);
    };
    ck_tag = function(name, opts) {
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
    var arrayCreator = Array;a = function(){return ck_tag('a', arguments)};i = function(){return ck_tag('i', arguments)};li = function(){return ck_tag('li', arguments)};p = function(){return ck_tag('p', arguments)};s = function(){return ck_tag('s', arguments)};th = function(){return ck_tag('th', arguments)};u = function(){return ck_tag('u', arguments)};ul = function(){return ck_tag('ul', arguments)};(function(){ul(function() {
  var _i, _len, _ref, _result, guy;
  _result = []; _ref = this.stooges;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    guy = _ref[_i];
    _result.push(li(guy));
  }
  return _result;
});}).call(ck_options.context);return ck_buffer.join('');
}