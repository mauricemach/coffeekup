var stooges;
stooges = ['moe', 'larry', 'curly'];
$(document).ready(function() {
  var codey;
  codey = function() {
    h2('Regular');
    return ul(function() {
      var _i, _len, _ref, _result, guy;
      _result = []; _ref = this.stooges;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        guy = _ref[_i];
        _result.push(li(guy));
      }
      return _result;
    });
  };
  return $('body').append(CoffeeKup.render(codey, {
    context: {
      stooges: stooges
    }
  }));
});
