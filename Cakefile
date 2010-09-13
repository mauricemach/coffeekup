exec = require('child_process').exec
coffeekup = require 'coffeekup'
render = coffeekup.render
benchmark = require './benchmark'

task 'build', ->
  exec 'coffee -c lib/coffeekup.coffee', (err) ->
    puts err if err
    exec 'cp lib/coffeekup.js examples/browser', (err) ->
      puts err if err

task 'test', ->
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
      puts "[Error] (#{ex.message})"

  test 'Literal text', ->
    'Just text' is render ->
      text 'Just text'

  test 'Default DOCTYPE', ->
    '<!DOCTYPE html>' is render ->
      doctype()

  test 'DOCTYPE', ->
    '<?xml version="1.0" encoding="utf-8" ?>' is render ->
      doctype 'xml'

  test 'Self-closing tags', ->
    '<br />' is (render -> br()) and
    '<img src="icon.png" alt="Icon" />' is render -> img src: 'icon.png', alt: 'Icon'

  test 'Normal tags', ->
    '<h1>hi</h1>' is render ->
      h1 'hi'

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
    "<script>$(document).ready(function() {\n            return alert('hi!');\n          });</script>" is render ->
      coffeescript ->
        $(document).ready ->
          alert 'hi!'

  test 'Comments', ->
    '<!--Comment-->' is render ->
      comment 'Comment'

  puts "\nTests: #{tests.length} | Passed: #{passed.length} | Failed: #{failed.length} | Errors: #{errors.length}"

task 'benchmark', ->
  benchmark.run()
