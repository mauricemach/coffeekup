(function(){ 
this.templates || (this.templates = {});
var createBuilder = function anonymous(data) {
var __slice = Array.prototype.slice;var __hasProp = Object.prototype.hasOwnProperty;var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };var __extends = function(child, parent) {  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }  function ctor() { this.constructor = child; }  ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype;  return child; };var __indexOf = Array.prototype.indexOf || function(item) {  for (var i = 0, l = this.length; i < l; i++) {    if (this[i] === item) return i;  } return -1; };
    var coffeescript, comment, doctype, h, ie, tag, text, yield, __ck, _ref, _ref2;
    if (data == null) {
      data = {};
    }
    if ((_ref = data.format) == null) {
      data.format = false;
    }
    if ((_ref2 = data.autoescape) == null) {
      data.autoescape = false;
    }
    __ck = {
      buffer: [],
      compile: function() {
        return this.buffer.join('');
      },
      esc: function(txt) {
        if (data.autoescape) {
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
        if (data.format) {
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
        var c, classes, i, id, _i, _j, _len, _len2, _ref3;
        classes = [];
        _ref3 = str.split('.');
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          i = _ref3[_i];
          if (__indexOf.call(i, '#') >= 0) {
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
      render_attrs: function(obj, prefix) {
        var k, v, _results;
        if (prefix == null) {
          prefix = '';
        }
        _results = [];
        for (k in obj) {
          v = obj[k];
          if (typeof v === 'boolean' && v) {
            v = k;
          }
          if (typeof v === 'function') {
            v = "(" + v + ").call(this);";
          }
          _results.push(typeof v === 'object' && !(v instanceof Array) ? this.render_attrs(v, prefix + k + '-') : v ? text(" " + (prefix + k) + "=\"" + (this.esc(v)) + "\"") : void 0);
        }
        return _results;
      },
      render_contents: function(contents) {
        var result;
        switch (typeof contents) {
          case 'string':
          case 'number':
          case 'boolean':
            return text(this.esc(contents));
          case 'function':
            if (data.format) {
              text('\n');
            }
            this.tabs++;
            result = contents.call(data);
            if (typeof result === 'string') {
              this.indent();
              text(this.esc(result));
              if (data.format) {
                text('\n');
              }
            }
            this.tabs--;
            return this.indent();
        }
      },
      render_tag: function(name, idclass, attrs, contents) {
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
          if (data.format) {
            text('\n');
          }
        } else {
          text('>');
          this.render_contents(contents);
          text("</" + name + ">");
          if (data.format) {
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
    yield = function(f) {
      var old_buffer, temp_buffer;
      temp_buffer = [];
      old_buffer = __ck.buffer;
      __ck.buffer = temp_buffer;
      f();
      __ck.buffer = old_buffer;
      return temp_buffer.join('');
    };
    h = function(txt) {
      return String(txt).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };
    doctype = function(type) {
      if (type == null) {
        type = 'default';
      }
      text(__ck.doctypes[type]);
      if (data.format) {
        return text('\n');
      }
    };
    text = function(txt) {
      __ck.buffer.push(String(txt));
      return null;
    };
    comment = function(cmt) {
      text("<!--" + cmt + "-->");
      if (data.format) {
        return text('\n');
      }
    };
    coffeescript = function(param) {
      switch (typeof param) {
        case 'function':
          return script("" + __ck.coffeescript_helpers + "(" + param + ").call(this);");
        case 'string':
          return script({
            type: 'text/coffeescript'
          }, function() {
            return param;
          });
        case 'object':
          param.type = 'text/coffeescript';
          return script(param);
      }
    };
    ie = function(condition, contents) {
      __ck.indent();
      text("<!--[if " + condition + "]>");
      __ck.render_contents(contents);
      text("<![endif]-->");
      if (data.format) {
        return text('\n');
      }
    };
    __ck.doctypes = {"5":"<!DOCTYPE html>","default":"<!DOCTYPE html>","xml":"<?xml version=\"1.0\" encoding=\"utf-8\" ?>","transitional":"<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">","strict":"<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">","frameset":"<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Frameset//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd\">","1.1":"<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.1//EN\" \"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd\">","basic":"<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML Basic 1.1//EN\" \"http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd\">","mobile":"<!DOCTYPE html PUBLIC \"-//WAPFORUM//DTD XHTML Mobile 1.2//EN\" \"http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd\">","ce":"<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"ce-html-1.0-transitional.dtd\">"};__ck.coffeescript_helpers = "var __slice = Array.prototype.slice;var __hasProp = Object.prototype.hasOwnProperty;var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };var __extends = function(child, parent) {  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }  function ctor() { this.constructor = child; }  ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype;  return child; };var __indexOf = Array.prototype.indexOf || function(item) {  for (var i = 0, l = this.length; i < l; i++) {    if (this[i] === item) return i;  } return -1; };";__ck.self_closing = ["area","base","br","col","command","embed","hr","img","input","keygen","link","meta","param","source","track","wbr","basefont","frame"];return __ck;
}
this.templates["helpers"]={};this.templates["nested"]={};this.templates["nested2"]={};this.templates["nested"]["deep"]={};this.templates["template1"] = function anonymous(data) {
var builder = createBuilder.call(this, data);var __slice = Array.prototype.slice;var __hasProp = Object.prototype.hasOwnProperty;var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };var __extends = function(child, parent) {  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }  function ctor() { this.constructor = child; }  ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype;  return child; };var __indexOf = Array.prototype.indexOf || function(item) {  for (var i = 0, l = this.length; i < l; i++) {    if (this[i] === item) return i;  } return -1; };;var a,b,div,i,label,li,p,rt,s,th,tr,u,ul,tt,input;a = function(){return builder.tag('a', arguments);};b = function(){return builder.tag('b', arguments);};div = function(){return builder.tag('div', arguments);};i = function(){return builder.tag('i', arguments);};label = function(){return builder.tag('label', arguments);};li = function(){return builder.tag('li', arguments);};p = function(){return builder.tag('p', arguments);};rt = function(){return builder.tag('rt', arguments);};s = function(){return builder.tag('s', arguments);};th = function(){return builder.tag('th', arguments);};tr = function(){return builder.tag('tr', arguments);};u = function(){return builder.tag('u', arguments);};ul = function(){return builder.tag('ul', arguments);};tt = function(){return builder.tag('tt', arguments);};input = function(){return builder.tag('input', arguments);};var wrap = function(){return (function (fn) {
    p(function() {
      return "==========Wrapper Start===>";
    });
    div(function() {
      return fn();
    });
    return p(function() {
      return "<===Wrapper End============";
    });
  }).apply(data, arguments);};var textbox = function(){return (function (attrs) {
    return wrap(function() {
      label({
        "for": "" + attrs.id
      }, function() {
        return "" + attrs.label;
      });
      return input("#" + attrs.id, {
        type: "text",
        value: "" + attrs.value
      });
    });
  }).apply(data, arguments);};(function(){
div(function() {
  p(function() {
    return "hi";
  });
  return ul(function() {
    var guy, _i, _len, _ref, _results;
    _ref = this.stooges;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      guy = _ref[_i];
      _results.push(li(guy));
    }
    return _results;
  });
});
}).call(data);return builder.compile();
};this.templates["withHelpers"] = function anonymous(data) {
var builder = createBuilder.call(this, data);var __slice = Array.prototype.slice;var __hasProp = Object.prototype.hasOwnProperty;var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };var __extends = function(child, parent) {  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }  function ctor() { this.constructor = child; }  ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype;  return child; };var __indexOf = Array.prototype.indexOf || function(item) {  for (var i = 0, l = this.length; i < l; i++) {    if (this[i] === item) return i;  } return -1; };;var a,b,div,em,h1,head,header,i,label,p,rt,s,th,tr,u,tt,input;a = function(){return builder.tag('a', arguments);};b = function(){return builder.tag('b', arguments);};div = function(){return builder.tag('div', arguments);};em = function(){return builder.tag('em', arguments);};h1 = function(){return builder.tag('h1', arguments);};head = function(){return builder.tag('head', arguments);};header = function(){return builder.tag('header', arguments);};i = function(){return builder.tag('i', arguments);};label = function(){return builder.tag('label', arguments);};p = function(){return builder.tag('p', arguments);};rt = function(){return builder.tag('rt', arguments);};s = function(){return builder.tag('s', arguments);};th = function(){return builder.tag('th', arguments);};tr = function(){return builder.tag('tr', arguments);};u = function(){return builder.tag('u', arguments);};tt = function(){return builder.tag('tt', arguments);};input = function(){return builder.tag('input', arguments);};var wrap = function(){return (function (fn) {
    p(function() {
      return "==========Wrapper Start===>";
    });
    div(function() {
      return fn();
    });
    return p(function() {
      return "<===Wrapper End============";
    });
  }).apply(data, arguments);};var textbox = function(){return (function (attrs) {
    return wrap(function() {
      label({
        "for": "" + attrs.id
      }, function() {
        return "" + attrs.label;
      });
      return input("#" + attrs.id, {
        type: "text",
        value: "" + attrs.value
      });
    });
  }).apply(data, arguments);};(function(){
header(function() {
  return h1(function() {
    return "Helpers compiled from file (see templates/helpers)";
  });
});

div(function() {
  wrap(function() {
    return "This is wrapped content";
  });
  return textbox({
    id: "" + this.id,
    value: "" + this.value,
    label: "" + this.label
  });
});
}).call(data);return builder.compile();
};this.templates["template2"] = function anonymous(data) {
var builder = createBuilder.call(this, data);var __slice = Array.prototype.slice;var __hasProp = Object.prototype.hasOwnProperty;var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };var __extends = function(child, parent) {  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }  function ctor() { this.constructor = child; }  ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype;  return child; };var __indexOf = Array.prototype.indexOf || function(item) {  for (var i = 0, l = this.length; i < l; i++) {    if (this[i] === item) return i;  } return -1; };;var a,b,div,i,label,p,q,rt,s,th,tr,u,tt,input;a = function(){return builder.tag('a', arguments);};b = function(){return builder.tag('b', arguments);};div = function(){return builder.tag('div', arguments);};i = function(){return builder.tag('i', arguments);};label = function(){return builder.tag('label', arguments);};p = function(){return builder.tag('p', arguments);};q = function(){return builder.tag('q', arguments);};rt = function(){return builder.tag('rt', arguments);};s = function(){return builder.tag('s', arguments);};th = function(){return builder.tag('th', arguments);};tr = function(){return builder.tag('tr', arguments);};u = function(){return builder.tag('u', arguments);};tt = function(){return builder.tag('tt', arguments);};input = function(){return builder.tag('input', arguments);};var wrap = function(){return (function (fn) {
    p(function() {
      return "==========Wrapper Start===>";
    });
    div(function() {
      return fn();
    });
    return p(function() {
      return "<===Wrapper End============";
    });
  }).apply(data, arguments);};var textbox = function(){return (function (attrs) {
    return wrap(function() {
      label({
        "for": "" + attrs.id
      }, function() {
        return "" + attrs.label;
      });
      return input("#" + attrs.id, {
        type: "text",
        value: "" + attrs.value
      });
    });
  }).apply(data, arguments);};(function(){
div(function() {
  return p(function() {
    return "I am the Grand Inquisitor from " + this.album;
  });
});
}).call(data);return builder.compile();
};this.templates["helpers"]["index"] = function anonymous(data) {
var builder = createBuilder.call(this, data);var __slice = Array.prototype.slice;var __hasProp = Object.prototype.hasOwnProperty;var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };var __extends = function(child, parent) {  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }  function ctor() { this.constructor = child; }  ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype;  return child; };var __indexOf = Array.prototype.indexOf || function(item) {  for (var i = 0, l = this.length; i < l; i++) {    if (this[i] === item) return i;  } return -1; };;var a,b,div,i,label,p,rt,s,tr,u,tt,input;a = function(){return builder.tag('a', arguments);};b = function(){return builder.tag('b', arguments);};div = function(){return builder.tag('div', arguments);};i = function(){return builder.tag('i', arguments);};label = function(){return builder.tag('label', arguments);};p = function(){return builder.tag('p', arguments);};rt = function(){return builder.tag('rt', arguments);};s = function(){return builder.tag('s', arguments);};tr = function(){return builder.tag('tr', arguments);};u = function(){return builder.tag('u', arguments);};tt = function(){return builder.tag('tt', arguments);};input = function(){return builder.tag('input', arguments);};var wrap = function(){return (function (fn) {
    p(function() {
      return "==========Wrapper Start===>";
    });
    div(function() {
      return fn();
    });
    return p(function() {
      return "<===Wrapper End============";
    });
  }).apply(data, arguments);};var textbox = function(){return (function (attrs) {
    return wrap(function() {
      label({
        "for": "" + attrs.id
      }, function() {
        return "" + attrs.label;
      });
      return input("#" + attrs.id, {
        type: "text",
        value: "" + attrs.value
      });
    });
  }).apply(data, arguments);};(function(){
({
  wrap: function(fn) {
    p(function() {
      return "==========Wrapper Start===>";
    });
    div(function() {
      return fn();
    });
    return p(function() {
      return "<===Wrapper End============";
    });
  },
  textbox: function(attrs) {
    return wrap(function() {
      label({
        "for": "" + attrs.id
      }, function() {
        return "" + attrs.label;
      });
      return input("#" + attrs.id, {
        type: "text",
        value: "" + attrs.value
      });
    });
  }
});
}).call(data);return builder.compile();
};this.templates["nested2"]["a"] = function anonymous(data) {
var builder = createBuilder.call(this, data);var __slice = Array.prototype.slice;var __hasProp = Object.prototype.hasOwnProperty;var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };var __extends = function(child, parent) {  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }  function ctor() { this.constructor = child; }  ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype;  return child; };var __indexOf = Array.prototype.indexOf || function(item) {  for (var i = 0, l = this.length; i < l; i++) {    if (this[i] === item) return i;  } return -1; };;var a,b,div,em,i,label,p,rt,s,tr,u,tt,input;a = function(){return builder.tag('a', arguments);};b = function(){return builder.tag('b', arguments);};div = function(){return builder.tag('div', arguments);};em = function(){return builder.tag('em', arguments);};i = function(){return builder.tag('i', arguments);};label = function(){return builder.tag('label', arguments);};p = function(){return builder.tag('p', arguments);};rt = function(){return builder.tag('rt', arguments);};s = function(){return builder.tag('s', arguments);};tr = function(){return builder.tag('tr', arguments);};u = function(){return builder.tag('u', arguments);};tt = function(){return builder.tag('tt', arguments);};input = function(){return builder.tag('input', arguments);};var wrap = function(){return (function (fn) {
    p(function() {
      return "==========Wrapper Start===>";
    });
    div(function() {
      return fn();
    });
    return p(function() {
      return "<===Wrapper End============";
    });
  }).apply(data, arguments);};var textbox = function(){return (function (attrs) {
    return wrap(function() {
      label({
        "for": "" + attrs.id
      }, function() {
        return "" + attrs.label;
      });
      return input("#" + attrs.id, {
        type: "text",
        value: "" + attrs.value
      });
    });
  }).apply(data, arguments);};(function(){
div(function() {
  return p(function() {
    return "I am nested2 template a, also";
  });
});
}).call(data);return builder.compile();
};this.templates["nested"]["a"] = function anonymous(data) {
var builder = createBuilder.call(this, data);var __slice = Array.prototype.slice;var __hasProp = Object.prototype.hasOwnProperty;var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };var __extends = function(child, parent) {  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }  function ctor() { this.constructor = child; }  ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype;  return child; };var __indexOf = Array.prototype.indexOf || function(item) {  for (var i = 0, l = this.length; i < l; i++) {    if (this[i] === item) return i;  } return -1; };;var a,b,div,em,i,label,p,rt,s,tr,u,tt,input;a = function(){return builder.tag('a', arguments);};b = function(){return builder.tag('b', arguments);};div = function(){return builder.tag('div', arguments);};em = function(){return builder.tag('em', arguments);};i = function(){return builder.tag('i', arguments);};label = function(){return builder.tag('label', arguments);};p = function(){return builder.tag('p', arguments);};rt = function(){return builder.tag('rt', arguments);};s = function(){return builder.tag('s', arguments);};tr = function(){return builder.tag('tr', arguments);};u = function(){return builder.tag('u', arguments);};tt = function(){return builder.tag('tt', arguments);};input = function(){return builder.tag('input', arguments);};var wrap = function(){return (function (fn) {
    p(function() {
      return "==========Wrapper Start===>";
    });
    div(function() {
      return fn();
    });
    return p(function() {
      return "<===Wrapper End============";
    });
  }).apply(data, arguments);};var textbox = function(){return (function (attrs) {
    return wrap(function() {
      label({
        "for": "" + attrs.id
      }, function() {
        return "" + attrs.label;
      });
      return input("#" + attrs.id, {
        type: "text",
        value: "" + attrs.value
      });
    });
  }).apply(data, arguments);};(function(){
div(function() {
  return p(function() {
    return "I am nested template a";
  });
});
}).call(data);return builder.compile();
};this.templates["nested"]["deep"]["c"] = function anonymous(data) {
var builder = createBuilder.call(this, data);var __slice = Array.prototype.slice;var __hasProp = Object.prototype.hasOwnProperty;var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };var __extends = function(child, parent) {  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }  function ctor() { this.constructor = child; }  ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype;  return child; };var __indexOf = Array.prototype.indexOf || function(item) {  for (var i = 0, l = this.length; i < l; i++) {    if (this[i] === item) return i;  } return -1; };;var a,b,div,em,i,label,p,rt,s,tr,u,tt,input;a = function(){return builder.tag('a', arguments);};b = function(){return builder.tag('b', arguments);};div = function(){return builder.tag('div', arguments);};em = function(){return builder.tag('em', arguments);};i = function(){return builder.tag('i', arguments);};label = function(){return builder.tag('label', arguments);};p = function(){return builder.tag('p', arguments);};rt = function(){return builder.tag('rt', arguments);};s = function(){return builder.tag('s', arguments);};tr = function(){return builder.tag('tr', arguments);};u = function(){return builder.tag('u', arguments);};tt = function(){return builder.tag('tt', arguments);};input = function(){return builder.tag('input', arguments);};var wrap = function(){return (function (fn) {
    p(function() {
      return "==========Wrapper Start===>";
    });
    div(function() {
      return fn();
    });
    return p(function() {
      return "<===Wrapper End============";
    });
  }).apply(data, arguments);};var textbox = function(){return (function (attrs) {
    return wrap(function() {
      label({
        "for": "" + attrs.id
      }, function() {
        return "" + attrs.label;
      });
      return input("#" + attrs.id, {
        type: "text",
        value: "" + attrs.value
      });
    });
  }).apply(data, arguments);};(function(){
p(function() {
  return "I am deep, not profound...find me in templates/deep/c.coffee";
});
}).call(data);return builder.compile();
};
}).call(this);