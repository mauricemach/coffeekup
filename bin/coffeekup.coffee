#!/usr/bin/env coffee

coffeekup = require 'coffeekup'
fs = require 'fs'
path = require 'path'
puts = console.log
OptionParser = require('coffee-script/optparse').OptionParser

# On coffee-script@0.9.6, argv looks like [filename],
# On coffee-script@1.0.0, argv looks like ["node", "path/to/coffee", filename]
if process.argv[0] is 'node' and process.argv.length >= 2
  argv = process.argv[2..]
else
  argv = process.argv[0..]

render = (input_path, output_directory) ->
  fs.readFile input_path, (err, contents) ->
    throw err if err
    html = coffeekup.render String(contents), options
    write input_path, html, output_directory

write = (input_path, html, output_directory) ->
  filename = path.basename(input_path, path.extname(input_path)) + '.html'
  dir = output_directory or path.dirname input_path
  path.exists dir, (exists) ->
    unless exists then fs.mkdirSync dir, 0777
    
    output_path = path.join dir, filename
    html = ' ' if html.length <= 0
    fs.writeFile output_path, html, (err) ->
      throw err if err
      puts html if options.print
      puts "Compiled #{input_path}" if options.watch

usage = '''
  Usage:
    coffeekup [OPTIONS] path/to/template.coffee
'''

switches = [
  ['-w', '--watch', 'Keeps watching the file and recompiling it when it changes']
  ['-o', '--output [DIR]', 'Specifies a directory to compile into.']
  ['-p', '--print', 'Prints the compiled html to stdout']
  ['-f', '--format', 'Applies line breaks to html output']
  ['-u', '--utils', 'Adds helper locals (currently only "render")']
  ['-h', '--help', 'Prints this help message']
  ['-v', '--version', 'Shows CoffeeKup version']
]

parser = new OptionParser switches, usage
options = parser.parse argv
args = options.arguments
delete options.arguments

puts parser.help() if options.help or argv.length is 0
puts coffeekup.version if options.version
if options.utils
  options.locals ?= {}
  options.locals.render = (file) ->
    contents = fs.readFileSync file
    coffeekup.render String(contents), options

if args.length > 0
  file = args[0]

  if options.watch
    fs.watchFile file, {persistent: true, interval: 500}, (curr, prev) ->
      return if curr.size is prev.size and curr.mtime.getTime() is prev.mtime.getTime()
      render file, options.output
  else render file, options.output
