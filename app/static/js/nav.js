$(document).ready(function () {
  $('body').on('click', '.top', function () {
    $('nav.menu').toggleClass('menu_show')
    setTimeout(function () {
      $('nav.menu').toggleClass('menu_show')
    }, 5000)
  })
  let menuItem
  menu = menu.replaceAll('&#39;', '"')
  menu = JSON.parse(menu)
  console.log(menu)
  thisPath = location.pathname //.split('/')[1]
  console.log(thisPath)
  menu.forEach(element => {
    if (element.url == thisPath) {
      menuItem = element.name
    }
  })
  $('.item-menu').each(function () {
    if ($(this).text() == menuItem) {
      $(this).addClass('active-menu')
    }
  })
})

const form_glob = document.querySelector('.auth-promo')
var phone = document.querySelector('#phone-glob')
const sms = document.querySelector('#sms-glob')
const send_sms = document.querySelector('.send-sms')
const confirm_sms = document.querySelector('.confirm-sms')

let cookies = objCookies()
let ajaxData = {}

function objCookies () {
  let cookies = document.cookie.split('; ')
  let objCookies = {}
  for (let i in cookies) {
    let c = cookies[i].split('=')
    objCookies[c[0]] = c[1]
  }
  return objCookies
}

function checkCookies () {
  let Keys = Object.keys(objCookies())
  console.log(' will follow')
  console.log(objCookies(), 'smth else ?')
  if ('promo' in Keys == false) {
    form_glob.style.display = 'block'
  }
}
