$(document).ready(function () {
  $('#phone').blur(function (e) {
    let phone = thePhone($(this).val())
    console.log(phone, phone.length)

    if (phone.length != 10) {
      flashMessage('неправильный формат телефона', false, flashTime)
      $(this).val('').focus()
      return
    } else {
      $(this).val(phoneString(phone))
    }
    console.log(phone)
  })
})
var flashTime = 2000
var Cook = getCookies()
var product_path = location.search
if (product_path) {
  product_path = product_path.replace('?', '')
  console.log(product_path)
} else {
  product_path = 'no-path'
  console.log(product_path)
}
console.log(Cook)

var search = window.location.search
console.log(search)
if (search.split('?')[1] == 'newTicket') {
  var ticket = { newTicket: `${search.split('?')[2]}` }
  console.log(ticket)
  $('#ticketid').val(ticket.newTicket)
} else {
  $('#delticket').hide()
}

var thisPhone = {}
thisPhone['phone'] = Cook.phone
thisPhone['Session'] = Cook.Session

function addressAction () {
  console.log('addressAction')
  let action = 'use'
  thisPhone.action = action
  addrData = getAddressData()
  console.log(addrData)
  deliveryActions(addrData)
}
function getAddressData () {
  let data = []
  let thisAddr = {}
  document.querySelectorAll('.form-control').forEach(item => {
    // console.log(item.value, item.name)
    let theName = item.name
    let value = item.value
    if (item.name == 'receiver_phone') {
      value = value.replace('+7', '').replace(/^8|\D/g, '')
    }
    // console.log(theName)

    thisAddr[theName] = value
    // data.push(item.value)
  })
  data.push(thisAddr)
  return data
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

function deliveryActions (arg) {
  // do not insert thisPhone in the calling prcedure
  arg.unshift(thisPhone)
  console.log('delivery actions:')
  console.log(arg)
  $.ajax({
    type: 'POST',
    url: '/deliveryData',
    data: JSON.stringify(arg),
    contentType: 'application/json',
    dataType: 'json',
    success: function (data) {
      console.log(data)
      let path = product_path == 'no-path' ? '/basket' : product_path

      window.location.href = path + '?spotid=' + data[0].spotid //  + data.address
      // window.location.href = '/basket'
    }
  })
}
