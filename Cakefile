exec = require('child_process').exec

task 'build', ->
  exec 'coffee -o build/ -c lib/coffeekup.coffee', (err) ->
    require('sys').puts err if err

task 'test', -> require('./test').run()

task 'benchmark', -> require('./benchmark').run()
