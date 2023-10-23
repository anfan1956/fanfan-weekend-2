/* 
    stages for processing the registration
    0 - nothing is defined
    1 - phone entered
        wrong number - 
            message - 
            return to 0

    2 - sms entered 
        wrong number -
            message
            return to 1

    3 - email entered
        wrong - 
            message
            return to 2

    4 - email code is entered
        wrong 
            message
            return to 3

    5 - preferences updated

    if coockie exists then 
    2 - as if sms message is correct
*/
var phone,
  mode,
  flashTime = 2000
// var data = {}
$(document).ready(function () {
  phone = objCookies().phone
  if (phone == undefined) {
    mode = 0
  } else {
    mode = 2
    $('#phone-span').text(phoneString(phone))
    ajaxData.phone = phone
    ajaxData.requestMail = true
    ajaxData.mode = mode
    promissed = registerData(ajaxData)
    promissed.done(function (data, state) {
      if (state == 'success') {
        $('#email').val(data.email).prop('disabled', true)
        // console.log(data)
        getPrefs(data)
      }
    })
  }
  selectConf(mode)
  $('#phone').keypress(function (e) {
    if (e.which === 13) {
      $('#btn1').click()
    }
  })
  $('#sms-code').keypress(function (e) {
    if (e.which === 13) {
      $('#btn2').click()
    }
  })

  $('#change-phone').click(function () {
    resetPhoneCoockie()
    location.reload(true)
  })

  $('#btn1').click(function () {
    phone = thePhone($('#phone').val())
    $('#phone-span').text(phoneString(phone))
    $('#sms-wrap').show()
    $(this).hide()
    ajaxData.phone = phone
    ajaxData.mode = 0
    registerData(ajaxData)
  })

  $('#btn2').click(function () {
    ajaxData.sms_entered = $('#sms-code').val()
    ajaxData.mode = 2
    promissed = registerData(ajaxData)
    promissed.done(function (data, state) {
      if (state == 'success') {
        console.log('btn2 click: ', data) //убрать после доработки

        if (!data.error) {
          $('#email').val(data.email).prop('disabled', true)
          let flMessage = 'Вы авторизованы.'
          let phoneStr = phoneString(phone)
          $('.item-menu-right').show().text(phoneStr)
          $('#incognito').css('display', 'none')
          if (data.promo) {
            // flMessage += ' На ваш телефон отправлен промокод ' + data.promo
            flMessage += ' Промо-скидки будут учтены автоматически'
          }
          flashMessage(flMessage, true, flashTime)
          getPrefs(data)
        } else {
          flashMessage('Неверный код СМС', false, flashTime)
          setTimeout(() => {
            location.reload(true)
          }, 5000)
        }
      }
      selectConf(data.mode)
    })
  })

  $('#change-mail').click(function () {
    mode = 3
    $(this).hide()
    selectConf(mode)
  })

  $('#mail-submit').click(function () {
    if ($('#email').val() == '') {
      $('#email').val('почта не зарегистрирована')
      console.log(changeMail((deleteMail = true)))
      promissed = registerData(changeMail((deleteMail = true)))
      return
    } else {
      console.log('else')

      $('#email-code-wrap').show()
      $(this).hide()
      $('#email-code').focus()
      promissed = registerData(changeMail((deleteMail = false)))
    }
  })

  $('#btn3').click(function () {
    promissed = registerData(emailCode())
    promissed.done(function (data, state) {
      if (state == 'success') {
        if (!data.error) {
          flashMessage('почта обновлена', true, flashTime)
          mode = 2
          selectConf(mode)
          $('#email').prop('disabled', true)
        } else {
          flashMessage(data.error, false, flashTime)
        }
      }
    })
  })

  $('#prefs').click(function () {
    let location = objCookies().currentLocation
    if (location) {
      window.location.href = location
      return
    } else {
      window.location.href = '/promo'
      console.log('no location defined')
    }
  })
  $('.checkboxes').each(function () {
    $(this).change(function () {
      promissed = registerData(prefsUpdate())
      promissed.done(function (data, state) {
        if (state == 'success') {
          if (!data.error) {
            flashMessage('настройки оповещений записаны', true, flashTime)
          } else {
            flashMessage(data.error, false, flashTime)
          }
        }
      })
    })
  })
})

$('#history').click(function () {
  checkOrders()
})

function checkOrders () {
  phone = objCookies().phone
  let phoneData = {
    phone: phone
  }
  console.log('clicked checkOrders, phone: ', phoneData)
  promissed = registerData(phoneData, 'customer_orders')
  promissed.done(function (data, state) {
    if (state == 'success') {
      console.log(data)
      ordersTable(data)
    }
  })
}

function ordersTable (data) {
  let parent = $('.orders')
  parent.empty()
  let html = ''
  html += '<table id = "orders-table" class="orders-table">'
  html += '<tr class= "tabHeader">'
  let colNames = Object.keys(data[0])
  for (let c in colNames) {
    html += '<th>' + colNames[c] + '</th>'
  }
  html += '</tr>'
  for (let d in data) {
    html += '<tr>'
    let row = Object.values(data[d])
    for (let i in row) {
      html += '<td>' + row[i] + '</td>'
    }
    html += '</tr>'
  }
  html += '</table>'
  parent.append(html)

  // $('.tabHeader').css({
  //   border: '1px solid red',
  //   // 'padding-top': '12px',
  //   // 'padding-bottom': '32px',
  //   'text-align': 'left',
  //   background: 'green',
  //   color: 'white'
  // })
}

function getPrefs (arg) {
  $('input[type=checkbox]').each(function () {
    var d = arg.length
    for (var d in arg) {
      if (d == $(this).prop('name')) {
        $(this).prop('checked', arg[d])
        // console.log(d, arg[d])
      }
    }
    // console.log($(this).prop('name'), data.promos)
  })
}

function selectConf (mode) {
  switch (mode) {
    case 0:
      $('#email-group').hide()
      $('#mail-prefs').hide()
      $('#sms-wrap').hide()
      $('#change-phone').hide()
      break

    case 2:
      $('#email-group').show()
      $('#change-phone').show()
      $('#change-mail').show()
      $('#prefs').show()
      $('#sms-wrap').hide()
      $('#email-code-wrap').hide()
      $('#mail-submit').hide()
      $('#btn1').hide()
      $('.row').hide()
      $('#mail-prefs').show()
      break

    case 3:
      $('#email').val('').prop('disabled', false).focus()
      $('#mail-submit').show()
      $('#change-phone').hide()
      $('#prefs').hide()
      break

    case 4:
      break

    default:
      break
  }
}

function registerData (arg, theUrl = 'register2') {
  console.log(JSON.stringify(arg))

  return $.ajax({
    type: 'POST',
    url: theUrl,
    data: JSON.stringify(arg),
    // data: arg,
    contentType: 'application/json',
    dataType: 'json'
  })
}

function changeMail (deleteMail) {
  console.log('deleteMail = ', deleteMail)

  let changeMailData = {
    mode: 3,
    phone: thePhone($('#phone-span').text())
  }
  if (deleteMail == false) {
    changeMailData.email = $('#email').val()
  } else {
    deleteMessage = 'delete email'
    changeMailData.mode = 2
    changeMailData.deleteEmail = deleteMessage
  }
  return changeMailData
}

function emailCode () {
  let emailCodeData = {
    mode: 4,
    phone: thePhone($('#phone-span').text()),
    email: $('#email').val(),
    code: $('#email-code').val()
  }
  return emailCodeData
}

function prefsUpdate (deleteMail = false) {
  let prefData = {
    phone: thePhone($('#phone-span').text())
  }
  if (deleteMail == false) {
    ;(prefData.mode = 5),
      (prefData.receipts = $('#receipts').prop('checked')),
      (prefData.collections = $('#collections').prop('checked')),
      (prefData.sales = $('#sales').prop('checked')),
      (prefData.promos = $('#promos').prop('checked'))
  } else {
    prefData.deleteMail = deleteMail
  }
  return prefData
}

function resetPhoneCoockie () {
  document.cookie = 'phone' + '=; expires=Thu, 01-Jan-70 00:00:01 GMT;'
  document.cookie = 'promo' + '=; expires=Thu, 01-Jan-70 00:00:01 GMT;'
  document.cookie =
    'currentLocation' + '=; expires=Thu, 01-Jan-70 00:00:01 GMT;'
  document.cookie = 'Session=newSession;max-age=3600;'
}
