(function() {
  $().ready(function() {
    return $('body').append(template({
      stooges: ['moe', 'larry', 'curly']
    }));
  });
}).call(this);
