$(document).ready(function () {
  $('body')
    .css('opacity', 1)
    .on('click', '.top', function () {
      $('nav.menu').toggleClass('menu_show')
      setTimeout(function () {
        $('nav.menu').toggleClass('menu_show')
      }, 5000)
    })
  let menuItem
  menu = menu.replaceAll('&#39;', '"')
  menu = JSON.parse(menu)
  // console.log(menu)
  thisPath = location.pathname //.split('/')[1]
  // console.log(thisPath)
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
  let phone = objCookies().phone

  if (phone == undefined) {
    // console.log('phone is not defined')
    $('.item-menu-right').css('display', 'none')
  } else {
    phone = phoneString(phone)
    $('#incognito').css('display', 'none')
    $('.item-menu-right').show().text(phone)
    // console.log(objCookies().phone)
  }
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

function thePhone (arg) {
  let tp = arg
    .replaceAll(' ', '')
    .replaceAll('-', '')
    .replace(/^8/, '')
    .replace(/^\+7/, '')
    .replaceAll('(', '')
    .replaceAll(')', '')
  return tp
}

function phoneString (arg) {
  let ni = '+7-' + thePhone(arg).replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
  return ni
  //   console.log(ni)
}
