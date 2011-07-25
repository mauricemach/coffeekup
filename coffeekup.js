(function() {
  var cache, coffee, coffeekup, coffeescript_helpers, skeleton;
  var __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  }, __slice = Array.prototype.slice;
  if (typeof window !== "undefined" && window !== null) {
    coffeekup = window.CoffeeKup = {};
    coffee = typeof CoffeeScript !== "undefined" && CoffeeScript !== null ? CoffeeScript : null;
  } else {
    coffeekup = exports;
    coffee = require('coffee-script');
  }
  coffeekup.version = '0.3.0beta';
  coffeekup.doctypes = {
    'default': '<!DOCTYPE html>',
    '5': '<!DOCTYPE html>',
    'xml': '<?xml version="1.0" encoding="utf-8" ?>',
    'transitional': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
    'strict': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
    'frameset': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">',
    '1.1': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
    'basic': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">',
    'mobile': '<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">',
    'ce': '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "ce-html-1.0-transitional.dtd">'
  };
  coffeescript_helpers = "var __slice = Array.prototype.slice;\nvar __hasProp = Object.prototype.hasOwnProperty;\nvar __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };\nvar __extends = function(child, parent) {\n  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }\n  function ctor() { this.constructor = child; }\n  ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype;\n  return child; };\nvar __indexOf = Array.prototype.indexOf || function(item) {\n  for (var i = 0, l = this.length; i < l; i++) {\n    if (this[i] === item) return i;\n  } return -1; };".replace(/\n/g, '');
  coffeekup.tags = 'a|abbr|acronym|address|applet|area|article|aside|audio|b|base|basefont\
|bdo|big|blockquote|body|br|button|canvas|caption|center|cite|code|col|colgroup\
|command|datalist|dd|del|details|dfn|dir|div|dl|dt|em|embed|fieldset|figcaption\
|figure|font|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hgroup|hr\
|html|i|iframe|img|input|ins|keygen|kbd|label|legend|li|link|map|mark|menu|meta\
|meter|nav|noframes|noscript|object|ol|optgroup|option|output|p|param|pre\
|progress|q|rp|rt|ruby|s|samp|script|section|select|small|source|span|strike\
|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title\
|tr|tt|u|ul|video|xmp'.replace(/\n/g, '').split('|');
  coffeekup.self_closing = ['area', 'base', 'basefont', 'br', 'col', 'frame', 'hr', 'img', 'input', 'link', 'meta', 'param'];
  skeleton = function(data) {
    var coffeescript, comment, doctype, h, tag, text, __ck, _base, _base2, _ref, _ref2, _ref3;
        if ((_ref = data.options) != null) {
      _ref;
    } else {
      data.options = {};
    };
        if ((_ref2 = (_base = data.options).format) != null) {
      _ref2;
    } else {
      _base.format = false;
    };
        if ((_ref3 = (_base2 = data.options).autoescape) != null) {
      _ref3;
    } else {
      _base2.autoescape = false;
    };
    __ck = {
      options: data.options,
      buffer: [],
      esc: function(txt) {
        if (this.options.autoescape) {
          return h(txt);
        } else {
          return String(txt);
        }
      },
      tabs: 0,
      repeat: function(string, count) {
        return Array(count + 1).join(string);
      },
      indent: function() {
        if (this.options.format) {
          return text(this.repeat('  ', this.tabs));
        }
      },
      tag: function(name, args) {
        var combo, i, _i, _len;
        combo = [name];
        for (_i = 0, _len = args.length; _i < _len; _i++) {
          i = args[_i];
          combo.push(i);
        }
        return tag.apply(data, combo);
      },
      render_idclass: function(str) {
        var c, classes, i, id, _i, _j, _len, _len2, _ref4;
        classes = [];
        _ref4 = str.split('.');
        for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
          i = _ref4[_i];
          if (i.indexOf('#') === 0) {
            id = i.replace('#', '');
          } else {
            if (i !== '') {
              classes.push(i);
            }
          }
        }
        if (id) {
          text(" id=\"" + id + "\"");
        }
        if (classes.length > 0) {
          text(" class=\"");
          for (_j = 0, _len2 = classes.length; _j < _len2; _j++) {
            c = classes[_j];
            if (c !== classes[0]) {
              text(' ');
            }
            text(c);
          }
          return text('"');
        }
      },
      render_attrs: function(obj) {
        var k, v, _results;
        _results = [];
        for (k in obj) {
          v = obj[k];
          _results.push(text(" " + k + "=\"" + (this.esc(v)) + "\""));
        }
        return _results;
      },
      render_tag: function(name, idclass, attrs, contents) {
        var result;
        this.indent();
        text("<" + name);
        if (idclass) {
          this.render_idclass(idclass);
        }
        if (attrs) {
          this.render_attrs(attrs);
        }
        if (__indexOf.call(this.self_closing, name) >= 0) {
          text(' />');
          if (this.options.format) {
            text('\n');
          }
        } else {
          text('>');
          switch (typeof contents) {
            case 'string':
            case 'number':
            case 'boolean':
              text(this.esc(contents));
              break;
            case 'function':
              if (this.options.format) {
                text('\n');
              }
              this.tabs++;
              result = contents.call(data);
              if (typeof result === 'string') {
                this.indent();
                text(this.esc(result));
                if (this.options.format) {
                  text('\n');
                }
              }
              this.tabs--;
              this.indent();
          }
          text("</" + name + ">");
          if (__ck.options.format) {
            text('\n');
          }
        }
        return null;
      }
    };
    tag = function() {
      var a, args, attrs, contents, idclass, name, _i, _len;
      name = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      for (_i = 0, _len = args.length; _i < _len; _i++) {
        a = args[_i];
        switch (typeof a) {
          case 'function':
            contents = a;
            break;
          case 'object':
            attrs = a;
            break;
          case 'number':
          case 'boolean':
            contents = a;
            break;
          case 'string':
            if (args.length === 1) {
              contents = a;
            } else {
              if (a === args[0]) {
                idclass = a;
              } else {
                contents = a;
              }
            }
        }
      }
      return __ck.render_tag(name, idclass, attrs, contents);
    };
    h = function(txt) {
      return String(txt).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };
    doctype = function(type) {
      if (type == null) {
        type = 'default';
      }
      text(__ck.doctypes[type]);
      if (data.options.format) {
        return text('\n');
      }
    };
    text = function(txt) {
      __ck.buffer.push(String(txt));
      return null;
    };
    comment = function(cmt) {
      text("<!--" + cmt + "-->");
      if (data.options.format) {
        return text('\n');
      }
    };
    coffeescript = function(input) {
      switch (typeof input) {
        case 'function':
          return script("" + __ck.coffeescript_helpers + "(" + input + ").call(this);");
        case 'string':
          return script({
            type: 'text/coffeescript'
          }, function() {
            return input;
          });
        case 'object':
          input.type = 'text/coffeescript';
          return script(input);
      }
    };
    return null;
  };
  skeleton = String(skeleton).replace(/function\s*\(data\)\s*\{/, '').replace(/return null;\s*\}$/, '');
  skeleton = coffeescript_helpers + skeleton;
  coffeekup.compile = function(template, options) {
    var code, hardcoded_locals, k, t, tag_functions, tags_used, v, _i, _j, _len, _len2, _ref, _ref2;
    if (options == null) {
      options = {};
    }
    if (typeof template === 'function') {
      template = String(template);
    } else if (typeof template === 'string' && (coffee != null)) {
      template = coffee.compile(template, {
        bare: true
      });
      template = "function(){" + template + "}";
    }
    hardcoded_locals = '';
    if (options.hardcode) {
      _ref = options.hardcode;
      for (k in _ref) {
        v = _ref[k];
        if (typeof v === 'function') {
          hardcoded_locals += "var " + k + " = function(){return (" + v + ").apply(data, arguments);};";
        } else {
          hardcoded_locals += "var " + k + " = " + (JSON.stringify(v)) + ";";
        }
      }
    }
    tag_functions = '';
    tags_used = [];
    _ref2 = coffeekup.tags;
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      t = _ref2[_i];
      if (template.indexOf(t) > -1 || hardcoded_locals.indexOf(t) > -1) {
        tags_used.push(t);
      }
    }
    tag_functions += "var " + (tags_used.join(',')) + ";";
    for (_j = 0, _len2 = tags_used.length; _j < _len2; _j++) {
      t = tags_used[_j];
      tag_functions += "" + t + " = function(){return __ck.tag('" + t + "', arguments);};";
    }
    code = tag_functions + hardcoded_locals + skeleton;
    code += "__ck.doctypes = " + (JSON.stringify(coffeekup.doctypes)) + ";";
    code += "__ck.coffeescript_helpers = " + (JSON.stringify(coffeescript_helpers)) + ";";
    code += "__ck.self_closing = " + (JSON.stringify(coffeekup.self_closing)) + ";";
    if (options.locals) {
      code += 'with(data.locals){';
    }
    code += "(" + template + ").call(data);";
    if (options.locals) {
      code += '}';
    }
    code += "return __ck.buffer.join('');";
    return new Function('data', code);
  };
  cache = {};
  coffeekup.render = function(template, data, options) {
    var k, tpl, v, _ref;
    if (data == null) {
      data = {};
    }
    if (options == null) {
      options = {};
    }
    for (k in options) {
      v = options[k];
      data[k] = v;
    }
        if ((_ref = data.cache) != null) {
      _ref;
    } else {
      data.cache = true;
    };
    if (data.cache && (cache[template] != null)) {
      tpl = cache[template];
    } else if (data.cache) {
      tpl = cache[template] = coffeekup.compile(template, data);
    } else {
      tpl = coffeekup.compile(template, data);
    }
    return tpl(data);
  };
  if (typeof window === "undefined" || window === null) {
    coffeekup.adapters = {
      simple: coffeekup.render,
      meryl: coffeekup.render,
      express: {
        compile: function(template, data) {
          data.hardcode = {
            partial: function() {
              return text(this.partial.apply(this, arguments));
            }
          };
          return coffeekup.compile(template, data);
        }
      }
    };
  }
}).call(this);
