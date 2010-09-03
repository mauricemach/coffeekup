#!/usr/bin/env coffee

coffeekup = require 'coffeekup'
fs = require 'fs'

usage = '''
  Usage:
    coffeekup INPUT_FILE

  Options:
    -v, --version
    -h, --help
'''

args = process.argv

if args.length is 0
  puts usage
else
  input = args[0]
  if input in ['-v', '--version']
    puts coffeekup.version
  else if input in ['-h', '--help']
    puts usage
  else
    code = fs.readFileSync input, 'utf8'
    puts coffeekup.render(code)
