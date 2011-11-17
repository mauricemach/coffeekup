$().ready ->
  $('body').append templates.template1(stooges: ['moe', 'larry', 'curly'])
  $('body').append templates.template2({ album : 'Joes Garage'})
