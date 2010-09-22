# CoffeeKup
Markup as CoffeeScript

In celebration of [whyday](http://whyday.org/), here's a revisiting of Markaby's concept, this time with the fine flavour of fresh [CoffeeScript](http://coffeescript.org):

    doctype 5
    html ->
      head ->
        meta charset: 'utf-8'
        title "#{@title} | My awesome website"
        meta(name: 'description', content: @description) if @description?
        link rel: 'stylesheet', href: '/stylesheets/app.css'
        style '''
          body {font-family: sans-serif}
          header, nav, section, footer {display: block}
        '''
        script src: '/javascripts/jquery.js'
        coffeescript ->
          $(document).ready ->
            alert 'Alerts are so annoying...'
      body ->
        header ->
          h1 @title
          nav ->
            ul ->
              (li -> a href: '/', -> 'Home') unless @path is '/'
              li -> a href: '/chunky', -> 'Chunky'
              li -> a href: '/bacon', -> 'Bacon!'
        section ->
          h2 "Let's count to 10:"
          p i for i in [1..10]
        footer ->
          p 'Bye!'

## _Why?

* Your template logic in a hell of a clean, expressive and flexible language.

* The most efficient CoffeeScript "filter" possible in a template engine (based on cutting edge ".toString()" technology).

* Embedded templates (one-file apps FTW!) that you can still recognize.

* Easily extend it into your own higher-level "dsl" by defining helpers as locals.

* The same template language in node.js and the browser.

* Works with both coffeescript and javascript apps.

* HTML 5 ready! Boring legacy doctypes and elements also available.

* It's just coffeescript! Syntax checking, syntax highlighting and other goodies are [already available](http://jashkenas.github.com/coffee-script/#resources).

## Installing

Just grab [node.js](http://nodejs.org/#download) and [npm](http://github.com/isaacs/npm) and you're set:

    npm install coffeekup

## Using

    coffeekup = require 'coffeekup'

    puts coffeekup.render "h1 'You can feed me raw strings!'"
    puts coffeekup.render -> h1 "Or live code. I'm not too picky."

With [express](http://expressjs.com):

    app.register '.coffee', require('coffeekup')
    app.set 'view engine', 'coffee'

    app.get '/', (req, res) ->
      # Will render views/index.coffee:
      res.render 'index', context: {foo: 'bar'}

In the browser (see /examples dir):

    <script src="coffee-script.js"></script>
    <script src="coffeekup.js"></script>

    <script type="text/coffeescript">
      template = -> h1 "Hello #{@world}"
      alert(CoffeeKup.render template, context: {world: 'mars'})
    </script>

Command-line:

    coffeekup FILE [> OUTPUT]

Note: javascript versions of the examples above will also do just fine!

## Caveats

* Like Markaby, not the fastest horse in the stable. Run `cake benchmark` for details. Performance seems to be pretty acceptable though while rendering templates as code, or as strings with cache on.

* No special syntax for ids and classes. Less of a big deal though if you're trying to shake off "divitis" and getting into html 5 semantic goodness already.

## Compatibility

Latest version tested with node 0.2.2 and CoffeeScript 0.9.4.
