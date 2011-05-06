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

  test 'CoffeeScript', ->
    """
      <script>;(function () {
                return $(document).ready(function() {
                  return alert('hi!');
                });
              })();</script>""" is render ->
      coffeescript ->
        $(document).ready ->
          alert 'hi!'

  test 'Context vars', ->
    '<h1>bar</h1>' is render (-> h1 @foo), context: {foo: 'bar'}

  test 'Local vars, hard-coded', ->
    obj = foo: 'bar'
    render (-> h1 obj.foo), locals: {obj: obj}
    obj.foo = 'baz'
    '<h1>bar</h1>' is render (-> h1 obj.foo), locals: {obj: obj}

  test 'Local vars, hard-coded (functions)', ->
    '<h1>The sum is: 3</h1>' is render(
      -> h1 "The sum is: #{sum 1, 2}"
      locals: {sum: (a, b) -> a + b}
    )

  test 'Local vars, hard-coded ("helpers")', ->
    textbox = (attrs) ->
      attrs.name = attrs.id
      attrs.type = 'text'
      tag 'input', attrs

    '<input id="foo" name="foo" type="text" />' is render (-> textbox id: 'foo'), locals: {textbox: textbox}

  test 'Local vars, dynamic', ->
    obj = ping: 'pong'
    render (-> h1 obj.ping), locals: {obj: obj}, dynamic_locals: yes
    obj.ping = 'pang'
    '<h1>pang</h1>' is render (-> h1 obj.ping), locals: {obj: obj}, dynamic_locals: yes

  test 'Comments', ->
    '<!--Comment-->' is render ->
      comment 'Comment'

  test 'Escaping', ->
    "<h1>&lt;script&gt;alert('&quot;pwned&quot; by c&amp;a &amp;copy;')&lt;/script&gt;</h1>" is render ->
      h1 h("<script>alert('\"pwned\" by c&a &copy;')</script>")

  test 'Autoescaping', ->
    "<h1>&lt;script&gt;alert('&quot;pwned&quot; by c&amp;a &amp;copy;')&lt;/script&gt;</h1>" is render(
      -> h1 "<script>alert('\"pwned\" by c&a &copy;')</script>"
      autoescape: yes
    )

  puts "\nTests: #{tests.length} | Passed: #{passed.length} | Failed: #{failed.length} | Errors: #{errors.length}"

puts = console.log
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
      puts "[OK]"
    else
      failed.push name
      puts "[Failed]"
  catch ex
    errors.push name
    puts "[Error] \"#{ex.message}\""
