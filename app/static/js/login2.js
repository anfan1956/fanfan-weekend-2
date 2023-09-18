// variables
const delay = 30000
const flash = document.querySelector('.flash')
let Cookies = getCookies()
let myForm = document.querySelector('#myForm')

// actions
let codeType = Cookies.code
console.log(`Cookies.code: ${codeType}`)
setTimeout(hide_flash, delay)

if (codeType != undefined) {
  openForm(codeType)
  let auth = document.querySelector('#auth')
  console.log(`openForm(codeType): ${codeType}`)
}

// functions
function hide_flash () {
  if (flash != null) {
    flash.style.display = 'none'
  }
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

function openForm (arg) {
  console.log(`openForm arg:  ${arg}`)

  myForm.style.display = 'block'
  if (arg == 'sms') {
    auth.style.display = 'none'
    document.querySelector('.input-email').style.display = 'none'
    document.getElementById('switcher').classList.toggle('form-container')
  } else if (arg == 'email') {
    auth.style.display = 'none'
    document.querySelector('.input-sms').style.display = 'none'
    document.getElementById('switcher')
    console.log('sw2')
    document.getElementById('switcher').classList.toggle('form-container-mail')
  } else if (arg == 'promo') {
    document.querySelector('.phone-group').style.display = 'none'
    document.querySelector('.email-group').style.display = 'block'
    document.querySelector('.button.back-to-shop').style.display = 'block'
    email = getCookies().email
    document.querySelector('#email').value = email
    myForm.style.display = 'none'
  } else if (arg == 'allDone') {
    auth.style.display = 'none'
    document.querySelector('.input-sms').style.display = 'none'
    document.getElementById('switcher')
    console.log('sw2')
    myForm.style.display = 'none'
    document.getElementById('switcher').classList.toggle('form-container-mail')
    currentLocation = Cookies.currentLocation
    document.cookie =
      'currentLocation = ' + currentLocation + '; Max-Age=0 ;path=/'
    setTimeout((window.location.href = currentLocation), 5000)
  }
  console.log(`openForm arg: ${arg}`)
  setTimeout(closeForm, delay)
}

function closeForm () {
  myForm.style.display = 'none'
}
