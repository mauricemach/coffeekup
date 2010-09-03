# CoffeeKup
Caffeinated Templates

In (shamelessly late) celebration of [whyday](http://whyday.org/), here goes a little experiment in revisiting Markaby's concept, this time with the fine flavour of fresh [CoffeeScript](http://coffeescript.org):

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
        script src: "/javascripts/jquery.js"
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

* Profit from a hell of a terse and expressive language in your templates.
* Keep the dignity of templates when embedding them in your app.
* Feels like an extensible language, as there's no syntactic distiction between your "helpers" and the original "vocabulary" of elements.
* Use it from coffeescript or javascript apps, in node.js or in the browser.
* It's just coffeescript! It doesn't need separate syntax highlighting, syntax checking, etc.

## Installing

Just grab [node.js](http://nodejs.org/#download) and [npm](http://github.com/isaacs/npm) and you're set:

    [sudo] npm install coffeekup

## Using

    coffeekup = require 'coffeekup'
    coffeekup.render "h1 'You can feed me raw strings!'"
    coffeekup.render -> h1 "Or live code. I'm not too picky."

With [express](http://expressjs.com):

    app.register '.coffee', require('coffeekup')
    app.set 'view engine', 'coffee'
    app.get '/', (req, res) ->
      # Will render views/index.coffee:
      res.render 'index', context: {foo: 'bar'}

In the browser (see /examples dir):

    <script src="/coffee-script.js"></script>
    <script src="/coffeekup.js"></script>
    <script type="text/coffeescript">
      template = -> h1 "Hello #{@world}"
      alert(CoffeeKup.render template, context: {world: 'mars'})
    </script>

Command-line:

    coffeekup FILE [> OUTPUT]

Please note that even though all examples were written in coffeescript, their javascript counterparts will also work just fine.

## Caveats

* Like Markaby, not the fastest horse in the stable. Run benchmark.coffee for details. In the context of node's screaming performance though, maybe it won't matter as much as it did for Markaby in the MRI. Your feedback is appreciated.
