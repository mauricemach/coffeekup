# CoffeeKup
Markup as CoffeeScript

In celebration of [whyday](http://whyday.org/), here's a revisiting of Markaby's concept, this time with the fine flavour of fresh [CoffeeScript](http://coffeescript.org):

    doctype 5
    html ->
      head ->
        meta charset: 'utf-8'
        title "#{@title or 'Untitled'} | My awesome website"
        meta(name: 'description', content: @description) if @description?
        link rel: 'stylesheet', href: '/stylesheets/app.css'
        style '''
          body {font-family: sans-serif}
          header, nav, section, footer {display: block}
        '''
        script src: '/javascripts/jquery.js'
        coffeescript ->
          $().ready ->
            alert 'Alerts are so annoying...'
      body ->
        header ->
          h1 @title or 'Untitled'
          nav ->
            ul ->
              (li -> a href: '/', -> 'Home') unless @path is '/'
              li -> a href: '/chunky', -> 'Bacon!'
              switch @user.role
                when 'owner', 'admin'
                  li -> a href: '/admin', -> 'Secret Stuff'
                when 'vip'
                  li -> a href: '/vip', -> 'Exclusive Stuff'
                else
                  li -> a href: '/commoners', -> 'Just Stuff'
        section ->
          h2 "Let's count to 10:"
          p i for i in [1..10]
        footer ->
          p 'Bye!'

Live demo at [coffeekup.org](http://coffeekup.org).

## _Why?

* Your rendering logic in a hell of a clean, expressive and flexible language.

* Embedded templates (one-file apps FTW!) that you can still recognize.

* The same template language _and_ implementation in node.js or the browser.

* The most efficient CoffeeScript "filter" possible in a template engine (based on cutting edge ".toString()" technology).

* Easily extend it into your own higher-level "dsl" by defining helpers as locals (see below).

* Great performance (see `cake benchmark`).

* Precompile your templates to standalone functions.

* Works with both coffeescript and javascript apps.

* HTML 5 ready! Boring legacy doctypes and elements also available.

* Optional HTML auto-escaping (or you can use the `h` helper).

* Optional output formatting with indentation.

* It's just coffeescript! Syntax checking, highlighting and other goodies are [already available](http://jashkenas.github.com/coffee-script/#resources).

## Installing

Just grab [node.js](http://nodejs.org/#download) and [npm](http://github.com/isaacs/npm) and you're set:

    npm install coffeekup

To get the `coffeekup` command, install it globally:

    npm install coffeekup -g

## Using

    coffeekup = require 'coffeekup'

    console.log coffeekup.render -> h1 "You can feed me templates as functions."
    console.log coffeekup.render "h1 'Or strings. I am not too picky.'"

Defining locals and context variables:

    template = ->
      h1 @title
      form method: 'post', action: 'login', ->
        textbox id: 'username'
        textbox id: 'password'
        button @title

    helpers =
      textbox: (attrs) ->
        attrs.type = 'text'
        attrs.name = attrs.id
        input attrs

    console.log coffeekup.render template, title: 'Log In', hardcode: helpers

Precompiling to functions:

    standalone_template = coffeekup.compile template
    console.log standalone_template(context: {foo: 'bar'}, locals: {ping: 'pong'})

With [zappa](http://github.com/mauricemach/zappa):

    get '/': ->
      @users = ['bob', 'alice', 'sinatra', 'zappa']
      render 'default'

    view ->
      for u in @users
        a href: "mailto:#{u}@gmail.com", -> u

With [express](http://expressjs.com):

    app.register '.coffee', require('coffeekup')
    app.set 'view engine', 'coffee'

    app.get '/', (req, res) ->
      # Will render views/index.coffee:
      res.render 'index', foo: 'bar'

With [meryl](http://github.com/coffeemate/meryl/blob/master/examples/jade-template/app.js) (see also [their own take](http://github.com/coffeemate/meryl/blob/master/examples/coffeekup-template)):

    meryl.h 'GET /', (req, resp) ->
      people = ['bob', 'alice', 'meryl']
      resp.render 'layout', content: 'index', context: {people: people}

    meryl.run
      templateDir: 'templates'
      templateExt: '.coffee'
      templateFunc: coffeekup.adapters.meryl

On the browser:

    <script src="template.js"></script>
    <script>
      $('body').append(template({foo: 'bar'}));
    </script>

This is one of many browser deployment possibilities, pre-compiling your template on the server to a standalone function. To see all serving suggestions, check out [regular](http://github.com/mauricemach/coffeekup/blob/master/examples/browser/regular/index.html), [decaf](http://github.com/mauricemach/coffeekup/blob/master/examples/browser/decaf/index.html) and [crème](http://github.com/mauricemach/coffeekup/blob/master/examples/browser/creme/index.html).

Command-line:

    $ coffeekup -h

    Usage:
      coffeekup [options] path/to/template.coffee

      -w, --watch        watch templates for changes, and recompile
      -o, --output       set the directory for compiled html
      -p, --print        print the compiled html to stdout
      -f, --format       apply line breaks and indentation to html output
      -u, --utils        add helper locals (currently only "render")
      -v, --version      display CoffeeKup version
      -h, --help         display this help message

See [/examples](http://github.com/mauricemach/coffeekup/tree/master/examples) for complete versions. Please note that even though all examples are given in coffeescript, you can also use their plain javascript counterparts just fine.

## Compatibility

Latest version tested with node 0.4.9 and CoffeeScript 1.1.1.

## Related projects

[ck](https://github.com/aeosynth/ck) - "a smaller, faster coffeekup": Alternative, barebones implementation.
[ckup](https://github.com/satyr/ckup) - "Markup as Coco": Similar engine but for [Coco](https://github.com/satyr/coco) ("Unfancy CoffeeScript").
[eco](https://github.com/sstephenson/eco) - "Embedded CoffeeScript templates": "EJS/ERB" for CoffeeScript.

## Special thanks

  - [Jeremy Ashkenas](https://github.com/jashkenas), for the amazing CoffeeScript language.
  - [why the lucky stiff](Why_the_lucky_stiff), for the inspiration.