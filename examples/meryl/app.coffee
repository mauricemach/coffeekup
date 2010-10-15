meryl = require 'meryl'
coffeekup = require 'coffeekup'

meryl.h 'GET /', (req, resp) ->
  resp.render 'layout', content: 'index', context: {people: ['bob', 'alice', 'meryl']}

meryl.run
  templateDir: 'templates'
  templateExt: '.coffee'
  templateFunc: (src, data) -> coffeekup.render src, context: data
