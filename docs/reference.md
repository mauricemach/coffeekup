# CoffeeKup 0.3.0 Reference

## The CoffeeKup object

Both the returned value from `require 'coffeekup'` and the global `CoffeeKup` created by `<script src="coffeekup.js">` will have the following attributes:

### compile

`CoffeeKup.compile(template, options)`

Compiles the template to a standalone function and returns it.

The input template can be provided as either a function or a string. In the latter case, the CoffeeScript compiler must be available.

Options:

- `locals`: if set to any "truthy" value, will compile the template with the main statements wrapped around a `with` block. The template will then support the `locals` option (see below). This is the "runtime" method of putting external variables in the local scope of the template.

- `hardcode`: an object containing values to be added to the template's local scope at "compile time". For each attribute in this object a `var [name] = [stringified value]` will be added to the template body.

#### Compiled template

The compiled template returned will be a function accepting a single object parameter:

`template(data)`

All attributes in `data` will be available to the template at `@` (`this`). Some attribute names are special and will trigger additional features:

- `locals`: if the template was compiled with the `locals` option, it will pass this variable to the `with` statement, putting all its attributes to the local scope.

- `format`: `false` by default. Whether to generate formatted HTML with indentation and line breaks, or just the natural "faux-minified" output.

- `autoescape`: `false` by default. Whether to autoescape all content or let you handle it on a case by case basis with the `h` function.

### render

`CoffeeKup.render(template, data, options)`

Compiles the template provided, runs it, and returns the resulting HTML string.

Options:

- `cache`: `false` by default. Whether to reuse compiled templates, or re-compile them every time.

### version

Version of CoffeeKup running.

### doctypes

List of doctypes available to the `doctype` function in templates. Object with doctype names as keys and their string contents as values. Can be customized at will.

The doctype named "default" will be used when none is specified (`doctype()`).

### tags

List of HTML elements available as functions. Array of strings, can be customized.

### self_closing

List of self-closing tags. Array of strings, can be customized.

## The template scope

CoffeeKup templates are CoffeeScript/JavaScript functions with certain special variables put in their local scope. These are usually functions, which will write their equivalent HTML to a buffer. The contents of this buffer will be the final return value of the template.

### Tag functions

By far the most important of these functions are those equivalent to each HTML element. They'll write the tags and attributes necessary to render the element.

They're designed to look very similar to their HTML output when written in CoffeeScript.

Below are examples on using these functions, their equivalent JavaScript code, and the corresponding HTML output.

Empty tags:

    div()
    <div></div>
    
    img()
    <img />

Attributes:

    img src: '/foo.png', alt: 'Foo'
    img({src: '/foo.png', alt: 'Foo'});
    <img src="/foo.png" alt="Foo" />
    
Contents (string):
    
    h1 'foo'
    h1('foo');
    <h1>Foo</h1>
    
    script '''
      alert('foo');
      console.log('bar');
    '''
    script("alert('foo');\nconsole.log('bar');");
    <script>alert('foo');
      console.log('bar');</script>
    
Contents (function):
    
    div -> 'Foo'
    div(function(){return 'Foo'});
    <div>Foo</div>
    
    div ->
      'Foo'
      'Bar'
    div(function(){'Foo'; return 'Bar';});
    <div>Bar</div>
    
    div ->
      'Foo'
      div 'Ping'
      'Bar'
    div(function(){'Foo'; div('Ping'); return 'Bar';});
    <div><div>Ping</div>Bar</div>
    
    div ->
      text 'Foo'
      div 'Ping'
      'Bar'
    div(function(){text('Foo'); div('Ping'); return 'Bar';});
    <div>Foo<div>Ping</div>Bar</div>

ID/class shortcut

    div '#id.class.anotherclass', 'string contents'
    div('#id.class.anotherclass', 'string contents');
    <div id="id" class="class anotherclass"></div>

    div '#id.class.anotherclass', -> h1 'Hullo'
    div('#id.class.anotherclass', function(){return h1('hullo')});
    <div id="id" class="class anotherclass"><h1>Hullo</h1></div>

    div '#id.class.anotherclass', style: 'position: fixed'
    div('#id.class.anotherclass', {style: 'position: fixed'});
    <div id="id" class="class anotherclass" style="position: fixed"></div>
  
### Other locals

#### doctype

Writes the doctype. Usage: `doctype()` (picks the default), `doctype 'xml'` (specifying). You can see and modify the list of doctypes at `CoffeeKup.doctypes`.

#### comment

Writes an HTML comment.

#### ie

Writes an IE conditional comment. Ex.:

    ie 'gte IE8', ->
      link href: 'ie.css', rel: 'stylesheet'

    <!--[if gte IE8]>
      <link href="ie.css" rel="stylesheet" />
    <![endif]-->

#### text

Writes arbitrary text to the buffer.

#### tag

Used for arbitrary tags. Works like the builtin tags, but the first string parameter is the name of the tag.

#### coffeescript

CoffeeScript-friendly shortcut to `script`:

    coffeescript -> alert 'hi'
    <script>
      [COFFEESCRIPT_HELPERS]
      (function(){return alert('hi');}).call(this);
    </script>

    coffeescript "alert 'hi'"
    <script type="text/coffeescript">alert 'hi'</script>

    coffeescript src: 'script.coffee'
    <script type="text/coffeescript" src="script.coffee"></script>


#### @

CoffeeScript shortcut to `this`. This is where all the input data can be accessed.

## Extending CoffeeKup

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

    console.log CoffeeKup.render template, title: 'Log In', hardcode: helpers

## The coffeekup command

When installing CoffeeKup with `npm install coffeekup -g`, you get a `coffeekup` command that allows you to generate HTML from CoffeeKup templates:

    $ coffeekup -h

    Usage:
      coffeekup [options] path/to/template.coffee

          --js           compile template to js function
      -n, --namespace    global object holding the templates (default: "templates")
      -w, --watch        watch templates for changes, and recompile
      -o, --output       set the directory for compiled html
      -p, --print        print the compiled html to stdout
      -f, --format       apply line breaks and indentation to html output
      -u, --utils        add helper locals (currently only "render")
      -v, --version      display CoffeeKup version
      -h, --help         display this help message