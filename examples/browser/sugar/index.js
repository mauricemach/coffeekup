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
    $('#nested').append(templates.nested2.a());
    return $('#helpers').append(templates.withHelpers({
      id: 'textbox1',
      value: 'someTextboxValue',
      label: 'labelForTextbox'
    }));
  });
}).call(this);
