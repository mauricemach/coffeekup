#!/usr/bin/env coffee

jade = require 'jade'
coffeekup = require 'coffeekup'

jade_template = '''
!!! 5
html(lang="en")
  head
    title= pageTitle
    :javascript
      | if (foo) {
      |    bar()
      | }
  body
    h1 Jade - node template engine
    #container
      - if (youAreUsingJade)
        p You are amazing
      - else
        p Get on it!
'''

coffeekup_template = ->
  doctype 5
  html lang: 'en', ->
    head ->
      title @title
      script '''
        if (foo) {
           bar()
        }
      '''
    body ->
      h1 'Jade - node template engine'
      div id: 'container', ->
        if @you_are_using_coffeekup
          p 'You are amazing'
        else
          p 'Get on it!'

#coffeekup_template = """
#  doctype 5
#  html lang: 'en', ->
#    head ->
#      title @title
#      script '''
#        if (foo) {
#           bar()
#        }
#      '''
#    body ->
#      h1 'Jade - node template engine'
#      div id: 'container', ->
#        if @you_are_using_coffeekup
#          p 'You are amazing'
#        else
#          p 'Get on it!'
#"""

benchmark = (title, code) ->
  start = new Date
  for i in [1..5000]
    code()
  puts "#{title}: #{new Date - start} ms"

benchmark 'Jade', ->
  jade.render jade_template, {locals: {pageTitle: 'pageTitle', youAreUsingJade: yes}}

benchmark 'CoffeeKup', ->
  coffeekup.render coffeekup_template, {context: {title: 'title', you_are_using_coffeekup: yes}}

benchmark 'Jade (cached)', ->
  jade.render jade_template, {locals: {pageTitle: 'pageTitle', youAreUsingJade: yes}, cache: yes, filename: 'aaa'}

benchmark 'CoffeeKup (cached)', ->
  coffeekup.render coffeekup_template, {context: {title: 'title', you_are_using_coffeekup: yes}, cache: yes}
