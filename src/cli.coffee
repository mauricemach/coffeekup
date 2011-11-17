coffeekup = require './coffeekup'
fs = require 'fs'
path = require 'path'
puts = console.log
{OptionParser} = require 'coffee-script/lib/coffee-script/optparse'

argv = process.argv[2..]
options = null

handle_error = (err) -> console.log err.stack if err

compilejs = (paths, output_directory, namespace = 'templates') ->
  templates = ''
  if paths.length > 1
    output_filename = namespace
  else
    output_filename = path.basename(paths[0], '.coffee')
  
  paths.forEach (input_path) ->  
    contents = fs.readFileSync input_path, 'utf-8'
    name = path.basename input_path, path.extname(input_path)
    func = coffeekup.templatize contents, options
    templates += "this.#{namespace}[#{JSON.stringify name}] = #{func};"
  
  output = """
      (function(){ 
      this.#{namespace} || (this.#{namespace} = {});
      var createBuilder = #{coffeekup.builder()}
      #{ templates }
      }).call(this);
  """
  ext = '.js'

  write null, output_filename, output, output_directory, ext

compilehtml = (input_path, output_directory) ->
  fs.readFile input_path, 'utf-8', (err, contents) ->
    handle_error err   
    name = path.basename input_path, path.extname(input_path)
    output = coffeekup.render contents, options
    ext = '.html'
    write input_path, name, output, output_directory, ext

write = (input_path, name, contents, output_directory, ext) ->
  filename = name + ext
  dir = output_directory or path.dirname input_path
  path.exists dir, (exists) ->
    unless exists then fs.mkdirSync dir, 0777
    
    output_path = path.join dir, filename
    contents = ' ' if contents.length <= 0
    fs.writeFile output_path, contents, (err) ->
      handle_error err
      puts contents if options.print
      puts "Compiled #{ output_path } (#{contents.length} bytes)" if options.watch

usage = '''
  Usage:
    coffeekup [options] path/to/template.coffee
'''

switches = [
  ['--js', 'compile template to js function']
  ['-n', '--namespace [name]', 'global object holding the templates (default: "templates")']
  ['-w', '--watch', 'watch templates for changes, and recompile']
  ['-o', '--output [dir]', 'set the directory for compiled html']
  ['-p', '--print', 'print the compiled html to stdout']
  ['-f', '--format', 'apply line breaks and indentation to html output']
  ['-u', '--utils', 'add helper locals (currently only "render")']
  ['-v', '--version', 'display CoffeeKup version']
  ['-h', '--help', 'display this help message']
]

@run = ->
  parser = new OptionParser switches, usage
  options = parser.parse argv
  args = options.arguments
  delete options.arguments

  puts parser.help() if options.help or argv.length is 0
  puts coffeekup.version if options.version
  if options.utils
    options.locals ?= {}
    options.locals.render = (file) ->
      contents = fs.readFileSync file, 'utf-8'
      coffeekup.render contents, options

  if args.length > 0
    src = path.resolve(process.cwd(), args[0])
    fs.stat src, (err, stats) ->
      files = [src] 
      if stats.isDirectory()
        files = (fs.readdirSync src).map (file) ->
            path.resolve src, file

      compile = ->
        compilehtml files[0], options.output
      if options.js
        compile = ->
          compilejs files, options.output, options.namespace
    
      if options.watch     
        files.forEach (file) ->
          fs.watchFile file, {persistent: true, interval: 500}, (curr, prev) ->          
            return if curr.size is prev.size and curr.mtime.getTime() is prev.mtime.getTime()
            compile()
    
      compile()
