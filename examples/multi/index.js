(function() {
  $().ready(function() {
    return $('body').append(templates.template1({
      stooges: ['moe', 'larry', 'curly']
    }));
  });
}).call(this);
