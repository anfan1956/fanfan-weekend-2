var for_ajax = Object()
var displayMode = 0

var btn_1 = document.querySelector('#btn1')

var phoneWrap = document.querySelector('.phone-wrap')
var smsWrap = document.querySelector('.sms-wrap')
var emailWrap = document.querySelector('.email-wrap')
var emailCodeWrap = document.querySelector('.email-code-wrap')
var list = document.querySelector('.list')

var phoneInput = document.querySelector('#phone')
var smsInput = document.querySelector('#sms-code')
var emailInput = document.querySelector('#email')
var emailCode = document.querySelector('#email-code')

var lbl_phone = document.querySelector('#lbl-phone')
var lbl_sms = document.querySelector('#lbl-sms')
var lbl_email = document.querySelector('#lbl-email')
var lbl_email_code = document.querySelector('#lbl-email-code')
var lbl_email_code2 = document.querySelector('#lbl-email-code2')
changeMode()

function sendInfo () {
  let path = '/register'
  for_ajax['phone'] = phoneInput.value
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
    for_ajax['phone_mail_confirmation'] = phoneInput.value
    if (phoneInput.value == undefined) {
      return
    }
  }
  promissed = ajaxGeneral(path, for_ajax)
  promissed.done(function (data) {
    console.log(data)
    changeMode(data.mode, data)
  })
}
function changeMode (mode, data) {
  console.log(`Display mode: ${mode}`)
  switch (mode) {
    case 0:
      console.log('Oranges are $0.59 a pound.')
      break
    case 1:
      smsWrap.style.display = ''
      break
    case 2:
      smsWrap.style.display = 'none'
      emailWrap.style.display = ''
      list.style.display = ''
      emailInput.value = data.email
      break
    case 3:
      break
    case 4:
      setTimeout(() => {
        window.location.href = '/'
      }, 5000)
      console.log('email conf succeeded')

    default:
      smsWrap.style.display = 'none'
      emailWrap.style.display = 'none'
      emailCodeWrap.style.display = 'none'
      list.style.display = 'none'
  }
}

function ajaxGeneral (path, arg) {
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
