$(function () {
  $('.basket-checkbox').click(calcSelected)
  calcTotals()
})

var pcsSelected
var totalSelected
var activeColor = '#b2ffe3'
var basketIcon = '../static/images/basket.svg'
var checks = document.querySelectorAll('.basket-checkbox')
var tr = document.querySelectorAll('tr')

var fields = ['styleid', 'color', 'size', 'price', 'discount', 'promo']

let obj = []
const Cook = getCookies()
var thisPhone = {}
thisPhone['phone'] = Cook.phone
thisPhone['Session'] = Cook.Session

$('#delivery > option').each(function () {
  const $select = document.querySelector('#delivery')
  let search = window.location.search.split('=')
  $option = search.slice(1)[0]
  if ($.isNumeric($option)) {
    $select.value = $option
    $('.address-warning').hide()
    $('#delivery').parent().css('background-color', 'var(--greenBack)')
  }
})

function selectAll () {
  checks.forEach(function (item) {
    item.checked = true
  })
  let totals = calcTotals()
  let toPay = totals.amount.toLocaleString('us')
  let pcs = totals.pcs.toLocaleString('us')
  $('#toPay').text(toPay)
  $('#total').text(toPay)
  $('#qty').text(pcs)
}

function calcSelected () {
  let inv = []
  let selected = {}
  let pcs = 0,
    amount = 0
  $('.basket-checkbox').each(function () {
    if ($(this).is(':checked')) {
      let product = {}
      let $parent = $(this).closest('.product')
      amount += parseInt(
        $parent.find('.num1').text().split(': ')[1].replaceAll(',', '')
      )
      pcs += parseInt($parent.find('.pcs').text().split(': ')[1])
      product.styleid = $parent.find('.model').text().split(': ')[1]
      product.color = $parent.find('.color').text().split(': ')[1]
      product.size = $parent.find('.size').text().split(': ')[1]
      product.price = parseInt(
        $parent.find('.price').text().replaceAll(',', '')
      )
      discount = $parent.find('.discount').text().split(': -')[1]
      product.discount =
        discount != undefined ? discount.replaceAll('%', '') / 100 : 0
      promo = $parent.find('.promo').text().split(': -')[1]
      product.promo = promo != undefined ? promo.replaceAll('%', '') / 100 : 0
      product.qty = $parent.find('.qty').text().split(': ')[1]
      product.total = parseInt(
        product.price *
          (1 - product.discount) *
          (1 - product.promo) *
          product.qty
      )
      inv.push(product)
    }
  })
  selected.amount = amount
  selected.pcs = pcs
  inv.unshift(selected)
  console.log(inv)
  let toPay = amount.toLocaleString('us')
  pcs = pcs.toLocaleString('us')
  $('#toPay').text(toPay)
  $('#qty').text(pcs)
  return inv
}

function clearSelected () {
  checks.forEach(function (item) {
    item.checked = false
  })
  calcSelected()
}

function openProductPage (arg) {
  window.location.href = '/product2/' + arg.styleid + '?' + 'color=' + arg.color
}

// first select the products to buy
// then pass it to flask with ajax
// flask runs the "web.basketAction_2" procedure is there a need for the procedure?
//how to permanently delete product from basket if the product is sold? should be in reservation proc
// web.reservation_create - the name of the procedure which must be run from oneClick
// original github file is "web.reservation_create__web.reservation_type.sql"
// oneClick is sending to def oneClick(): where payment link is requested, creates pmtParams and pass it over
// to the function pmt_link which creates a link with a retrn url
// returnUrl = 'http://10.0.0.7:5001/promo?trace?' meaning that when payment is executed, the browser
// will goto the /promo with parameters and will initialize the "order_status_site" procedure upon load

// !!!!!!! will have to finish delivery logs for the web.reservation_json proc !!
function buySelected () {
  let delivery = $('#delivery option:selected')
  if (delivery.val() == 'choose address') {
    flashMessage('нужно выбрать способ доставки')
    return false
  }
  if ($.isNumeric(delivery.val())) {
    spotid = delivery.val()
    thisPhone.spotid = spotid
  } else {
    pickupid = delivery.val().split('-')[1]
    thisPhone.pickupid = pickupid
  }
  let inv = calcSelected()
  let orderTotal = inv[0].amount
  thisPhone.orderTotal = orderTotal
  thisPhone.procName = 'ON_SITE RESERVATION'
  console.log(thisPhone)
  inv.shift()
  console.log(inv)
  promissed = basketActions(inv)
  promissed.done(function (data, state) {
    if (state == 'success') {
      console.log(data)
      if (!data.error) {
        flashMessage('Товар зарезервирован. Переход к оплате', true, 5000)
        window.location.href = data
      } else {
        flashMessage(data.error, false, 5000)
        window.location.href = '/basket'
      }
    }
    console.log(data, state)
  })
}

// new version actually working
function removeSelected () {
  let action = 'remove'
  thisPhone.procName = action
  thisPhone.uuid = Cook.Session

  let inv = calcSelected()
  inv.shift()
  console.log(inv)
  if (inv.error) {
    flashMessage('ничего не выбрано')
    return
  }
  promissed = basketActions(inv)
  promissed.done(function (data) {
    console.log(data)
    if (data.success) {
      flashMessage('товар удален из корзины', true)
      console.log(data)
      setTimeout(() => {
        location.reload(true)
      }, 1500)
    }
  })
}

function deliveryAction () {
  var value = $('#delivery').val()
  console.log(value)
  if (value == 'new-address') {
    window.location.href = '/delivery'
  } else if (value == 'choose address') {
    $('#delivery').parent().css('background-color', 'var(--redBack)')
    $('.address-warning').css('display', 'block')
  } else if (value == 'deliverTo') {
    $('#delivery').parent().css('background-color', 'var(--blueBack)')
    $('.address-warning').css('display', 'none')
  } else if ($.isNumeric(value)) {
    $('#delivery').parent().css('background-color', 'var(--greenBack)')
    $('.address-warning').css('display', 'none')
  } else {
    $('#delivery').parent().css('background-color', 'var(--sandBack)')
    $('.address-warning').css('display', 'none')
  }
}

function getCookies () {
  let Cookies = {}
  document.cookie.split('; ').forEach(el => {
    el = el.replaceAll('"', '')
    c = el.split('=')
    Cookies[c[0]] = c[1]
  })
  return Cookies
}

function basketActions (arg) {
  console.log(arg)
  if (arg.error) {
    return arg
  }
  // do not insert thisPhone in the calling prcedure
  arg.unshift(thisPhone)
  console.log('basket actions:', arg)
  return $.ajax({
    type: 'POST',
    url: '/basket_actions',
    data: JSON.stringify(arg),
    async: false,
    contentType: 'application/json',
    dataType: 'json'
  })
}

$(function () {
  $('.minus').click(function () {
    var $input = $(this).parent().find('input')
    let count = parseInt($input.val()) - 1
    count = count < 0 ? 0 : count
    $input.val(count)
    $input.change()
    $price = parseInt($(this).closest('tr').find('td').eq(5).text().trim('\n'))
    $total = $price * count
    $(this).closest('tr').find('td').eq(9).html($total)
    $('#total').html($total)
    calculateTotals()
    submitChanges()
    return false
  })
  $('.plus').click(function () {
    var $input = $(this).parent().find('input')
    let $max = parseInt(
      $(this).closest('tr').find('td').eq(10).text().trim('\n')
    )
    let count = parseInt($input.val()) + 1
    if (count > $max) {
      flashMessage('превышено максимальное количество')
    }
    count = count > $max ? $max : count
    $input.val(count)
    $input.change()
    console.log($max)
    $price = parseInt($(this).closest('tr').find('td').eq(5).text().trim('\n'))
    $total = $price * $input.val()
    $(this).closest('tr').find('td').eq(9).html($total)
    $('#total').text($total)
    calculateTotals()
    submitChanges()
    return false
  })
})

// this function iterates throug the rows of a table and returns total
function calcTotals () {
  let totals = {}
  let pcs = 0,
    amount = 0
  $('.num1').each(function () {
    amount += parseInt($(this).text().replaceAll(',', '').split(': ')[1])
  })
  $('.pcs').each(function () {
    pcs += parseInt($(this).text().replaceAll(',', '').split(': ')[1])
  })
  totals.amount = amount
  totals.pcs = pcs
  amount = amount.toLocaleString('us')
  $('#total').text(amount)
  return totals
}

// this function is to record changes to basket when + or - is clicked
// to be created anew
function submitChanges () {
  console.log(newObj)
}