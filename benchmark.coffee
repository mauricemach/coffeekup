jade = require 'jade'
coffeekup = require 'coffeekup'

jade_template = '''
  !!! 5
  html(lang="en")
    head
      meta(charset="utf-8")
      title= title
      style
        | body {font-family: "sans-serif"}
        | section, header {display: block}
    body
      section
        header
          h1= title
        - if (inspired)
          p Create a witty example
        - else
          p Go meta
'''

coffeekup_template = ->
  doctype 5
  html lang: 'en', ->
    head ->
      meta charset: 'utf-8'
      title @title
      style '''
        body {font-family: "sans-serif"}
        section, header {display: block}
      '''
    body ->
      section ->
        header ->
          h1 @title
        if @inspired
          p 'Create a witty example'
        else
          p 'Go meta'

coffeekup_string_template = """
  doctype 5
  html lang: 'en', ->
    head ->
      meta charset: 'utf-8'
      title @title
      style '''
        body {font-family: "sans-serif"}
        section, header {display: block}
      '''
    body ->
      section ->
        header ->
          h1 @title
        if @inspired
          p 'Create a witty example'
        else
          p 'Go meta'
"""

benchmark = (title, code) ->
  start = new Date
  for i in [1..5000]
    code()
  puts "#{title}: #{new Date - start} ms"

exports.run = ->
  benchmark 'CoffeeKup (code)', ->
    coffeekup.render coffeekup_template, {context: {title: 'test', inspired: no}}

  benchmark 'CoffeeKup (string)', ->
    coffeekup.render coffeekup_string_template, {context: {title: 'test', inspired: no}}

  benchmark 'CoffeeKup (string, cache on)', ->
    coffeekup.render coffeekup_string_template, {context: {title: 'test', inspired: no}, cache: on}

  benchmark 'Jade', ->
    jade.render jade_template, {locals: {title: 'test', inspired: no}}

  benchmark 'Jade (cache on)', ->
    jade.render jade_template, {locals: {title: 'test', inspired: no}, cache: on, filename: 'test'}
