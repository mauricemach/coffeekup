(function() {
  $().ready(function() {
    $('body').append(templates.template1({
      stooges: ['moe', 'larry', 'curly']
    }));
    return $('body').append(templates.template2({
      album: 'Joes Garage'
    }));
  });
}).call(this);
