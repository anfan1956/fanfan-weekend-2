$(document).ready(function () {
  var token = 'a41f1ff7f075f3e816fde56302a342e077d65969'
  $('#fio').suggestions({
    token: token,
    type: 'NAME',
    /* Вызывается, когда пользователь выбирает одну из подсказок */
    onSelect: function (suggestion) {
      console.log(suggestion)
    }
  })
  $('#address').suggestions({
    token: 'a41f1ff7f075f3e816fde56302a342e077d65969',
    type: 'ADDRESS',
    /* Вызывается, когда пользователь выбирает одну из подсказок */
    onSelect: function (suggestion) {
      console.log(suggestion)
    }
  })
})
