let ticket = window.location.href.split('/')
console.log(ticket, typeof ticket)

ticket = ticket.slice(-1)[0].split('?')[1]
console.log(ticket + ' ticket first ' + typeof ticket)

// $.post('/postmethod', {
//   javascript_data: ticket
// })

var lbl_ticket = document.querySelector('.lbl-2.ticket')
var ticket_input = document.getElementById('ord_id')
var ticket_type = document.getElementById('ord_id').value
var button = document.querySelector('[name="insert"]')
var button_update = document.querySelector('[name="update"]')
var receiver = document.querySelector('#fio')
var phone = document.querySelector('#phone')
var addr = document.querySelector('#address')
var ticketForm = document.querySelector('#delticket')
console.log(ticket_input.value == '', ': ticket')

if (ticket_input.value == '') {
  ticketForm.style.display = 'none'
}
// console.log(`d_data: ${d_data}, ticketid: ${ticketid}`)

d_data = d_data
  .replaceAll('&#39;, ', '";"')
  .replaceAll('&#39;', '')
  .replaceAll('{', '{"')
  .replaceAll('}', '"}')
  .replaceAll(': ', '":"')
  .replaceAll(';', ',')
// .split(';')
// console.log(`before JSON: ${d_data}`)
if (d_data != 'None') {
  data = JSON.parse(d_data)
  // console.log(data)
  receiver.value = data.recipient
  phone.value = data.phone
  addr.value = data.addr
  button.classList.add('hidden')
  button_update.classList.remove('hidden')
} else {
  button.classList.remove('hidden')
  button_update.classList.add('hidden')
}

// console.log(d_data, typeof d_data)

// ticket_input.value = ticket

// console.log(ticket_input.value)
// console.log(ticket_type)

lbl_ticket.innerHTML = ticket == 'order' ? '№ заказа' : '№ билета'

// button.addEventListener('click', buttonClick)
button_update.addEventListener('click', buttonClick)

// ticket_input.addEventListener('change', loadDeliveryData(true))
// // phone.addEventListener('change', loadDeliveryData(true))
addr.addEventListener('change', loadDeliveryData(true))

function loadDeliveryData (action) {
  if (action) {
    button_update.removeEventListener('click', buttonClick)
  } else {
    button_update.addEventListener('click', buttonClick)
  }
  //   console.log(action)
  receiver.focus()
}

function buttonClick (e) {
  e.preventDefault()
  console.log('prevent')
  window.location.href = '/delivery/' + document.getElementById('ord_id').value
}
