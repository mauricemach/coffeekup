(function() {
  $().ready(function() {
    return $('body').append(template({
      context: {
        stooges: ['moe', 'larry', 'curly']
      }
    }));
  });
}).call(this);
