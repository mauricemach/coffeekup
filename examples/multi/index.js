(function() {
  $().ready(function() {
    $('body').append(templates.template2());
    return $('body').append(templates.template1({
      stooges: ['moe', 'larry', 'curly']
    }));
  });
}).call(this);
