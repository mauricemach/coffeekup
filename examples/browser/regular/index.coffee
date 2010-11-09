$().ready ->
  $('body').append template(context: {stooges: ['moe', 'larry', 'curly']})
