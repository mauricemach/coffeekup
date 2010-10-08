stooges = ['moe', 'larry', 'curly']

$(document).ready ->
  codey = ->
    h2 'Regular'

    ul ->
      for guy in @stooges
        li guy

  $('body').append CoffeeKup.render(codey, context: {stooges: stooges})
