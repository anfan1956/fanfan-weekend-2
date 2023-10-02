let trace = window.location.search.split('&orderId')[0].split('?')
let Order = new Object()

let promo_button = document.querySelector('#btn-get-promo')
let currentLocation = window.location.pathname

const Cook = new Object()
let promo = document.cookie.split('; ')
promo.forEach(element => {
  i = element.split('=')
  Cook[i[0]] = i[1]
})
displayButton()

function displayButton () {
  if (Cook.promo != null) {
    console.log('Есть промо!')
    promo_button.style.display = 'none'
  } else {
    console.log('no promo')
  }
}

function getPromo () {
  document.cookie = 'currentLocation = ' + currentLocation + ';path=/'
  console.log(document.cookie, ' just created')
  window.location.href = '/login' /* + currentLocation*/
}

if (trace[1] == 'trace') {
  let orderid = trace[2]
  Order['orderNumber'] = orderid
  console.log(Order)
  tracePayment(Order)
  //   console.log(typeof tracePayment(), 'dkj')
}

promo_button.addEventListener('click', function () {
  console.log('get promo!')
  window.location.href = '/register2' /* + currentLocation*/
})

function tracePayment (args) {
  let data_str = JSON.stringify(args)
  console.log(data_str, 'smth')
  $.ajax({
    type: 'POST',
    // url: '{{{paymentTrace}}}',
    url: '/orderPayment',
    data: JSON.stringify(args),
    contentType: 'application/json',
    dataType: 'json',
    success: function (data, state) {
      console.log(data)
      console.log(state)
      // alert('ajax success')
      //   window.location.href = data
    },
    error: function (err) {
      console.log(err.responseText, ': error ', err) // <-- printing error message to console
    }
  })
}
