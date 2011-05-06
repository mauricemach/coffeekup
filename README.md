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
        @input attrs

    console.log coffeekup.render template, context: {title: 'Log In'}, locals: helpers

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
      res.render 'index', context: {foo: 'bar'}

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
      $('body').append(template(context: {foo: 'bar'}));
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

## Change Log:

**v0.2.3** (2011-05-06):

  - Compatible with npm 1.x.
  - Converting any ampersands (instead of /&(?!\w+;/) to &amp; when escaping html.
  - New CLI option -o / --output [DIR] (specifies a directory to compile into).
  - Self-closing tags are now: 'area', 'base', 'basefont', 'br', 'col', 'frame', 'hr', 'img', 'input', 'link', 'meta' and 'param'.

**v0.2.2** (2011-01-05):

  - Updated to CoffeeScript 1.0.0 and node 0.2.6/0.3.3.

**v0.2.1** (2010-11-09):

  - Updated to CoffeeScript 0.9.5 and node 0.2.5/0.3.1.
  - Fixed string templates compilation in opera.

**v0.2.0** (2010-11-09):

  - Huge performance gains, now among the fastest. See `cake benchmark`.
  - Compile templates into standalone functions with `coffeekup.compile`.
  - Option `format` to add line breaks and indentation to output.
  - Escape HTML automatically with the `autoescape` option, or manually with the `h` local.
  - CLI behaviour closer to CoffeeScript's: compiles to `filename.html` by default, can watch and recompile with `-w`.
  - CLI `-u`/`--utils` option to make build-time utility locals available to templates (currently only `render`).

## Compatibility

Latest version tested with node 0.4.7 and CoffeeScript 1.1.0.
