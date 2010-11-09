meryl = require 'meryl'
coffeekup = require 'coffeekup'

meryl.h 'GET /', (req, resp) ->
  people = ['bob', 'alice', 'meryl']
  resp.render 'layout', content: 'index', context: {people: people}

meryl.run
  templateDir: 'templates'
  templateExt: '.coffee'
  templateFunc: coffeekup.adapters.meryl

puts 'Listening on 3000...'
