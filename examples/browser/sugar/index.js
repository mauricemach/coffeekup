(function() {
  $().ready(function() {
    $('body').append(templates.template1({
      stooges: ['moe', 'larry', 'curly']
    }));
    $('body').append(templates.template2({
      album: 'Joes Garage'
    }));
    $('#nested').append(templates.nested.a());
    $('#nested').append(templates.nested.deep.c());
    return $('#nested').append(templates.nested2.a());
  });
}).call(this);
