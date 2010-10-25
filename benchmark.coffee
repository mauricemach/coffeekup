coffeekup = require 'coffeekup'
jade = require 'jade'
ejs = require 'ejs'
eco = require 'eco'

data = 
  title: 'test'
  inspired: no
  users: [
    {email: 'house@gmail.com', name: 'house'}
    {email: 'cuddy@gmail.com', name: 'cuddy'}
    {email: 'wilson@gmail.com', name: 'wilson'}
  ]

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
        ul ->
          for user in @users
            li user.name
            li -> a href: "mailto:#{user.email}", -> user.email

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
        ul ->
          for user in @users
            li user.name
            li -> a href: "mailto:\#{user.email}", -> user.email
"""

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
        ul
          - each user in users
            li= user.name
            li
              a(href=user.email)= user.email
'''

ejs_template = '''
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <title><%= title %></title>
      <style>
        body {font-family: "sans-serif"}
        section, header {display: block}
      </style>
    </head>
    <body>
      <section>
        <header>
          <h1><%= title %></h1>
        </header>
        <% if (inspired) { %>
          <p>Create a witty example</p>
        <% } else { %>
          <p>Go meta</p>
        <% } %>
        <ul>
          <% for (user in users) { %>
            <li><%= user.name %></li>
            <li><a href="<%= user.email %>"><%= user.email %></a></li>
          <% } %>
        </ul>
      </section>
    </body>
  </html>
'''

eco_template = '''
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <title><%= @title %></title>
      <style>
        body {font-family: "sans-serif"}
        section, header {display: block}
      </style>
    </head>
    <body>
      <section>
        <header>
          <h1><%= @title %></h1>
        </header>
        <% if @inspired: %>
          <p>Create a witty example</p>
        <% else: %>
          <p>Go meta</p>
        <% end %>
        <ul>
          <% for user in @users: %>
            <li><%= user.name %></li>
            <li><a href="<%= user.email %>"><%= user.email %></a></li>
          <% end %>
        </ul>
      </section>
    </body>
  </html>
'''

benchmark = (title, code) ->
  start = new Date
  for i in [1..5000]
    code()
  puts "#{title}: #{new Date - start} ms"

exports.run = ->
  benchmark 'CoffeeKup (code)', -> coffeekup.render coffeekup_template, context: data
  benchmark 'CoffeeKup (string)', -> coffeekup.render coffeekup_string_template, context: data
  benchmark 'CoffeeKup (code, cache off)', -> coffeekup.render coffeekup_template, context: data, cache: off
  benchmark 'CoffeeKup (string, cache off)', -> coffeekup.render coffeekup_string_template, context: data, cache: off
  benchmark 'Jade (cache off)', -> jade.render jade_template, locals: data
  benchmark 'Jade (cache on)', -> jade.render jade_template, locals: data, cache: on, filename: 'test'
  benchmark 'ejs (cache off)', -> ejs.render ejs_template, locals: data
  benchmark 'ejs (cache on)', -> ejs.render ejs_template, locals: data, cache: on, filename: 'test'
  benchmark 'Eco', -> eco.render eco_template, data
