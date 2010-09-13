exec = require('child_process').exec
benchmark = require './benchmark'
test = require './test'

task 'build', ->
  exec 'coffee -c lib/coffeekup.coffee', (err) ->
    puts err if err
    exec 'cp lib/coffeekup.js examples/browser', (err) ->
      puts err if err

task 'test', ->
  test.run()

task 'benchmark', ->
  benchmark.run()
