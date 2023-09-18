console.log(`sms: ${sms}, phone: ${phone}, e_code: ${e_code}`)
let flash = document.querySelector('.flash')
if (flash != null) {
  let confirmation_mes = flash.innerText
  console.log(confirmation_mes, ': confirmation_mes message')
  const mail_form_messages = [
    'Почта подтверждена',
    'Промокод отправлен на ваш телефон',
    'Неверный код подтверждения почты'
  ]

  //  hardcoding promocode, did not have time to think of better
  if (mail_form_messages.includes(confirmation_mes, 1)) {
    console.log('got message')
    document.querySelector('.phone-group').style.display = 'none'
    document.querySelector('.email-group').style.display = 'block'
    document.querySelector('.button.back-to-shop').style.display = 'block'
    email = getCookies().email
    document.querySelector('#email').value = email
  } else if (confirmation_mes == mail_form_messages[0]) {
    document.querySelector('.auth').style.display = 'none'
    let currLoc = getCookies().currentLocation
    console.log(currLoc)
    window.location.href = currLoc
  }
}

const flashTimeout = setTimeout(hide_flash, 20000)
function hide_flash () {
  if (flash != null) {
    flash.style.display = 'none'
  }
  // console.log(flash)
}

function getCookies () {
  let Cookies = {}
  document.cookie.split('; ').forEach(el => {
    el = el.replaceAll('"', '')
    c = el.split('=')
    // console.log(c)
    Cookies[c[0]] = c[1]
  })
  return Cookies
}

let myForm = document.getElementById('myForm')
console.log(switcher.className, 'switcher.classname')

if (sms != '' || e_code != '') {
  document.querySelector('#auth').style.display = 'none'
  if (sms != '') {
    document.querySelector('.input-email').style.display = 'none'
    document.querySelector('#input-sms').focus()
    console.log('sw1')
    document.getElementById('switcher').classList.toggle('form-container')
    // document.getElementById('switcher').classList.toggle('form-container-mail')

    // switcher.stylelist.toggle('form-container')
  } else if (e_code != '') {
    document.querySelector('.input-sms').style.display = 'none'
    document.getElementById('switcher')
    console.log('sw2')
    document.getElementById('switcher').classList.toggle('form-container-mail')
    // switcher.stylelist.toggle('form-container-mail')
  }
  openForm()
}
function openForm () {
  myForm.style.display = 'block'
}
function closeForm () {
  myForm.style.display = 'none'
}

// function findEmail (args) {
//   $.ajax({
//     type: 'POST',
//     url: '/checkEmail',
//     data: JSON.stringify(args),
//     contentType: 'application/json',
//     dataType: 'json',
//     success: function (data, state) {
//       console.log(data.email)

//       document.querySelector('#email').value = data.email
//       // window.location.href = data
//     },
//     error: function (err) {
//       console.log(err.responseText, ': error ', err) // <-- printing error message to console
//     }
//   })
// }
