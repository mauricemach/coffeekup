**v0.3.0beta** (2011-07-xx):

  - Solves express integration issues and eliminates the need for a meryl adapter.
  - `ck.render tpl, foo: 'bar'` now accessible as `h1 @foo`.
  - `ck.render tpl, locals: {foo: 'bar'}` now implemented by default through
  the `with` keyword (past behavior with `dynamic_locals: true`).
  - `ck.render tpl, hardcode: {foo: 'bar'}` will hardcode these locals.
  - Optional third param to `ck.render`.
  - Gone with ck_* locals, now all implementation inside `__ck`.
  - `coffeescript src: 'file.coffee'` and `coffeescript 'string'`.
  - `coffeescript -> code()` now correctly adds coffeescript helpers to the output.
  - Doctypes now editable at `coffeekup.doctypes`. Using `doctypes['default']`
  instead of `doctypes['5']` by default.

**v0.2.3** (2011-05-06):

  - Compatible with npm 1.x.
  - Converting any ampersands (instead of /&(?!\w+;/) to &amp; when escaping html.
  - New CLI option -o / --output [DIR] (specifies a directory to compile into).
  - Self-closing tags are now: 'area', 'base', 'basefont', 'br', 'col', 'frame', 'hr', 'img', 'input', 'link', 'meta' and 'param'.

**v0.2.2** (2011-01-05):

  - Updated to CoffeeScript 1.0.0 and node 0.2.6/0.3.3.

**v0.2.1** (2010-11-23):

  - Updated to CoffeeScript 0.9.5 and node 0.2.5/0.3.1.
  - Fixed string templates compilation in opera.

**v0.2.0** (2010-11-09):

  - Huge performance gains, now among the fastest. See `cake benchmark`.
  - Compile templates into standalone functions with `coffeekup.compile`.
  - Option `format` to add line breaks and indentation to output.
  - Escape HTML automatically with the `autoescape` option, or manually with the `h` local.
  - CLI behaviour closer to CoffeeScript's: compiles to `filename.html` by default, can watch and recompile with `-w`.
  - CLI `-u`/`--utils` option to make build-time utility locals available to templates (currently only `render`).

