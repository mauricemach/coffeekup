@run = ->
  test 'Literal text', ->
    'Just text' is render ->
      text 'Just text'

  test 'Default DOCTYPE', ->
    '<!DOCTYPE html>' is render ->
      doctype()

  test 'DOCTYPE', ->
    '<?xml version="1.0" encoding="utf-8" ?>' is render ->
      doctype 'xml'

  test 'Custom tag', ->
    '<custom></custom>' is render ->
      tag 'custom'

  test 'Custom tag with attributes', ->
    '<custom foo="bar" ping="pong"></custom>' is render ->
      tag 'custom', foo: 'bar', ping: 'pong'

  test 'Custom tag with attributes and inner content', ->
    '<custom foo="bar" ping="pong">zag</custom>' is render ->
      tag 'custom', foo: 'bar', ping: 'pong', -> 'zag'

  test 'Self-closing tags', ->
    '<br />' is render(-> br()) and
    '<img src="icon.png" alt="Icon" />' is render -> img src: 'icon.png', alt: 'Icon'

  test 'Common tag', ->
    '<p>hi</p>' is render ->
      p 'hi'

  test 'Attributes', ->
    '<a href="/" title="Home"></a>' is render ->
      a href: '/', title: 'Home'

  test 'HereDocs', ->
    "<script>$(document).ready(function(){\n  alert('test');\n});</script>" is render ->
      script """
        $(document).ready(function(){
          alert('test');
        });
      """

  test 'CoffeeScript helper (function)', ->
    expected = "<script>var __slice = Array.prototype.slice;var __hasProp = Object.prototype.hasOwnProperty;var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };var __extends = function(child, parent) {  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }  function ctor() { this.constructor = child; }  ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype;  return child; };var __indexOf = Array.prototype.indexOf || function(item) {  for (var i = 0, l = this.length; i < l; i++) {    if (this[i] === item) return i;  } return -1; };(function () {\n          return alert('hi');\n        })();</script>"
    expected is render ->
      coffeescript -> alert 'hi'

  test 'CoffeeScript helper (string)', ->
    "<script type=\"text/coffeescript\">alert 'hi'</script>" is render ->
      coffeescript "alert 'hi'"

  test 'CoffeeScript helper (object)', ->
    "<script src=\"script.coffee\" type=\"text/coffeescript\"></script>" is render ->
      coffeescript src: 'script.coffee'

  test 'Context vars', ->
    '<h1>bar</h1>' is render (-> h1 @foo), {foo: 'bar'}

  test 'Local vars, hard-coded', ->
    obj = foo: 'bar'
    render (-> h1 obj.foo), hardcode: {obj: obj}
    obj.foo = 'baz'
    '<h1>bar</h1>' is render (-> h1 obj.foo), hardcode: {obj: obj}

  test 'Local vars, hard-coded (functions)', ->
    '<h1>The sum is: 3</h1>' is render(
      -> h1 "The sum is: #{sum 1, 2}"
      hardcode: {sum: (a, b) -> a + b}
    )

  test 'Local vars, hard-coded ("helpers")', ->
    textbox = (attrs) ->
      attrs.name = attrs.id
      attrs.type = 'text'
      tag 'input', attrs

    '<input id="foo" name="foo" type="text" />' is render (-> textbox id: 'foo'),
    hardcode: {textbox: textbox}

  test 'Local vars', ->
    obj = ping: 'pong'
    render (-> h1 obj.ping), locals: {obj: obj}
    obj.ping = 'pang'
    '<h1>pang</h1>' is render (-> h1 obj.ping), locals: {obj: obj}

  test 'Comments', ->
    '<!--Comment-->' is render ->
      comment 'Comment'

  test 'Escaping', ->
    "<h1>&lt;script&gt;alert('&quot;pwned&quot; by c&amp;a &amp;copy;')&lt;/script&gt;</h1>" is render ->
      h1 h("<script>alert('\"pwned\" by c&a &copy;')</script>")

  test 'Autoescaping', ->
    "<h1>&lt;script&gt;alert('&quot;pwned&quot; by c&amp;a &amp;copy;')&lt;/script&gt;</h1>" is render(
      -> h1 "<script>alert('\"pwned\" by c&a &copy;')</script>"
      options: {autoescape: yes}
    )

  log "\nTests: #{tests.length} | Passed: #{passed.length} | Failed: #{failed.length} | Errors: #{errors.length}"

log = console.log
print = require('sys').print
ck = require './lib/coffeekup'
render = ck.render

[tests, passed, failed, errors] = [[], [], [], []]

test = (name, code) ->
  tests.push name
  print "Testing \"#{name}\"... "
  try
    if code()
      passed.push name
      log "[OK]"
    else
      failed.push name
      log "[Failed]"
  catch ex
    errors.push name
    log "[Error] \"#{ex.message}\""
