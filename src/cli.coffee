coffeekup = require './coffeekup'
fs = require 'fs'
path = require 'path'
puts = console.log
{OptionParser} = require 'coffee-script/lib/coffee-script/optparse'

argv = process.argv[2..]
options = null

handle_error = (err) -> console.log err.stack if err

# shamelessly stolen from https://gist.github.com/825583
readDir = (seed, start, callback) ->
  fs.lstat start, (err, stat) ->
    isDir = (abspath) ->
      fs.stat abspath, (err, stat) ->
        if stat.isDirectory()
          found.dirs.push abspath
          found.ns.push abspath.replace(seed, '')
          readDir seed, abspath, (err, data) ->
            found.dirs = found.dirs.concat(data.dirs)
            found.ns = found.ns.concat(data.ns)
            found.files = found.files.concat(data.files)
            callback null, found  if ++processed is total
        else
          found.files.push abspath
          callback null, found  if ++processed is total
    return callback(err)  if err
    found =
      dirs: []
      files: []
      ns: []

    total = 0
    processed = 0
    if stat.isDirectory()
      fs.readdir start, (err, files) ->
        total = files.length
        x = 0
        l = files.length

        while x < l
          isDir path.join(start, files[x])
          x++
    else
      callback new Error("path: " + start + " is not a directory")

compilejs = (paths, output_directory, namespace = 'templates', src_dir) ->
  templates = ''
  if paths.files.length > 1
    output_filename = namespace
  else
    output_filename = path.basename(paths.files[0], '.coffee')

  convertNs = (ns) ->
    root = "this.#{namespace}"
    return root if not ns
    tmp = ''
    agg = tmp += ("[#{JSON.stringify part}]" or "") for part in ns.split('/') when part isnt ''
    "#{root}#{agg}"

  templates += "#{convertNs(ns)}={};" for ns in paths.ns

  paths.files.forEach (input_path) ->  
    ns = path.dirname(input_path).replace(src_dir, '') if src_dir
    contents = fs.readFileSync input_path, 'utf-8'
    name = path.basename input_path, path.extname(input_path)
    func = coffeekup.templatize contents, options
    templates += "#{convertNs(ns)}[#{JSON.stringify name}] = #{func};"
  
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
      paths = 
          files : [src] 
          dirs : []
          ns : []

      execute = ->
        compile = ->
          compilehtml paths.files[0], options.output
        if options.js
          compile = ->
            compilejs paths, options.output, options.namespace, src
    
        if options.watch     
          paths.files.forEach (file) ->
            fs.watchFile file, {persistent: true, interval: 500}, (curr, prev) ->          
              return if curr.size is prev.size and curr.mtime.getTime() is prev.mtime.getTime()
              compile()
    
        compile()

      if stats.isDirectory()
        readDir src, src, (err, results) ->
            paths = results
            execute()
      else
        execute()

