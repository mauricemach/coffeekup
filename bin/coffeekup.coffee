#!/usr/bin/env coffee

coffeekup = require 'coffeekup'
fs = require 'fs'
path = require 'path'
puts = console.log
OptionParser = require('coffee-script/optparse').OptionParser

render = (input_path) ->
  fs.readFile input_path, (err, contents) ->
    throw err if err
    html = coffeekup.render String(contents), options
    write input_path, html

write = (input_path, html) ->
  filename = path.basename(input_path, path.extname(input_path)) + '.html'
  dir = path.dirname input_path
  output_path = path.join dir, filename
  html = ' ' if html.length <= 0
  fs.writeFile output_path, html, (err) ->
    puts html if options.print
    puts "Compiled #{input_path}" if options.watch

usage = '''
  Usage:
    coffeekup [OPTIONS] path/to/template.coffee
'''

switches = [
  ['-w', '--watch', 'Keeps watching the file and recompiling it when it changes']
  ['-p', '--print', 'Prints the compiled html to stdout']
  ['-f', '--format', 'Applies line breaks to html output']
  ['-u', '--utils', 'Adds helper locals (currently only "render")']
  ['-h', '--help', 'Prints this help message']
  ['-v', '--version', 'Shows CoffeeKup version']
]

parser = new OptionParser switches, usage
options = parser.parse process.argv
args = options.arguments
delete options.arguments

puts parser.help() if options.help or process.argv.length is 0
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
      render file
  else render file
