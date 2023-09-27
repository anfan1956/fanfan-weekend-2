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
var phone, mode
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
      }
    })
  }
  selectConf(mode)
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
        if (!data.error) {
          $('#email').val(data.email).prop('disabled', true)
        } else {
          flashMessage('Неверный код СМС', false, 5000)
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
    $('#email-code-wrap').show()
    $(this).hide()
    $('#email-code').focus()
    promissed = registerData(changeMail())
  })

  $('#btn3').click(function () {
    promissed = registerData(emailCode())
    promissed.done(function (data, state) {
      if (state == 'success') {
        if (!data.error) {
          flashMessage('почта обновлена', true, 5000)
          mode = 2
          selectConf(mode)
          $('#email').prop('disabled', true)
        } else {
          flashMessage(data.error, false, 5000)
        }
      }
    })
  })

  $('#prefs').click(function () {
    promissed = registerData(prefsUpdate())
    promissed.done(function (data, state) {
      if (state == 'success') {
        if (!data.error) {
          flashMessage('настройки записаны', true, 5000)
        } else {
          flashMessage(data.error, false, 5000)
        }
      }
    })
  })
})

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

function registerData (arg) {
  return $.ajax({
    type: 'POST',
    url: 'register2',
    data: JSON.stringify(arg),
    contentType: 'application/json',
    dataType: 'json'
  })
}

function changeMail () {
  let changeMailData = {
    mode: 3,
    phone: thePhone($('#phone-span').text()),
    email: $('#email').val()
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

function prefsUpdate () {
  let prefData = {
    mode: 5,
    phone: thePhone($('#phone-span').text()),
    receipts: $('#receipts').prop('checked'),
    collections: $('#collections').prop('checked'),
    sales: $('#sales').prop('checked'),
    promos: $('#promos').prop('checked')
  }
  return prefData
}

function resetPhoneCoockie () {
  document.cookie = 'phone' + '=; expires=Thu, 01-Jan-70 00:00:01 GMT;'
  document.cookie = 'promo' + '=; expires=Thu, 01-Jan-70 00:00:01 GMT;'
  document.cookie = 'Session' + '=; expires=Thu, 01-Jan-70 00:00:01 GMT;'
}
