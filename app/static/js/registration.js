var for_ajax = Object()
var displayMode
var phone
$(document).ready(function () {
  phone = objCookies().phone
  // console.log(phone)
  if (phone == undefined) {
    displayMode = undefined
  } else {
    displayMode = 2
    sendInfo(true)
  }
  changeMode(displayMode, phone)
  $('#change-mail').click(function () {
    $('.change').hide()
    $('.mail-submit').show()
    $('#email').val('').focus()
  })
  $('.mail-submit').on('click', function () {
    $(this).hide()
    // changeMode()
    $('.email-code-wrap').show().css('display', 'flex')
  })
  $('#btn3').click(function () {
    sendInfo()
  })
})
var btn_1 = document.querySelector('#btn1')
var smsWrap = document.querySelector('.sms-wrap')
var emailWrap = document.querySelector('.email-wrap')
var emailCodeWrap = document.querySelector('.email-code-wrap')
var list = document.querySelector('.list')
var smsInput = document.querySelector('#sms-code')
var emailInput = document.querySelector('#email')
var emailCode = document.querySelector('#email-code')

function sendInfo (requestMail = false) {
  let path = '/register'
  if (phone == undefined) {
    phone = thePhone($('#phone').val())
  }
  for_ajax['phone'] = phone
  if (requestMail == true) {
    for_ajax['requestMail'] = true
  }

  if (smsInput.value) {
    for_ajax['sms_enter'] = smsInput.value
    smsInput.value = ''
  }
  if (emailInput.value) {
    for_ajax['email_new'] = emailInput.value
    delete for_ajax.phone
    console.log(`ajax email input new ${emailInput.value}`)
  }
  if (emailCode.value) {
    for_ajax['emailCode'] = emailCode.value
    for_ajax['phone_mail_confirmation'] = phone
    // if (phoneInput.value == undefined) {
    //   return
    // }
  }
  console.log(for_ajax, ' for ajax')

  promissed = ajaxGeneral(path, for_ajax)
  promissed.done(function (data) {
    // console.log(data, ' lets see')
    changeMode(data.mode, data)
  })
}

function changeMode (mode, data) {
  console.log(`Display mode: ${mode}`)
  console.log(data)

  switch (mode) {
    case 0:
      break
    case 1:
      smsWrap.style.display = ''
      $('#btn1').hide()
      phone = thePhone($('#phone').val())
      $('.area-code').text(phoneString(phone))
      break
    case 2:
      $('#incognito').hide()
      $('.item-menu-right').show().text(phoneString(phone))
      $('.row').hide()
      $('.area-code').text(phoneString(phone))
      $('#btn1').hide()
      $('.change').show()
      smsWrap.style.display = 'none'
      emailWrap.style.display = ''
      list.style.display = ''
      emailInput.value = data.email
      break
    case 3:
      break
    case 4:
      // setTimeout(() => {
      //   window.location.href = '/'
      // }, 5000)
      location.reload(true)
      console.log('email conf succeeded')

    default:
      smsWrap.style.display = 'none'
      emailWrap.style.display = 'none'
      emailCodeWrap.style.display = 'none'
      list.style.display = 'none'
      $('.change').hide()
  }
}

function ajaxGeneral (path, arg) {
  console.log(path, arg, ' from ajax General')

  return $.ajax({
    type: 'POST',
    url: path,
    data: JSON.stringify(arg),
    contentType: 'application/json',
    dataType: 'json'
  })
}

$('#email').change(function () {
  if (emailInput) {
    emailCodeWrap.style.display = ''
    emailCode.focus()
    console.log(emailInput.value)

    sendInfo()
  }
})
function resetPhoneCoockie () {
  console.log('delete coockie')
  document.cookie = 'phone' + '=; expires=Thu, 01-Jan-70 00:00:01 GMT;'
  document.cookie = 'promo' + '=; expires=Thu, 01-Jan-70 00:00:01 GMT;'
  document.cookie = 'Session' + '=; expires=Thu, 01-Jan-70 00:00:01 GMT;'
}
function changeEmail () {
  $('#email').text()
}
