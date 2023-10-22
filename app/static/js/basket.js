if (window.matchMedia('(max-width: 768px)').matches) {
  console.log('switch to different location')
  let search = location.search
  window.location.href = '/basketS' + search
  // do functionality on screens smaller than 768px
}

p = p //all the products, defined as flask data variable in catalog.html
  .replaceAll('&#39;', '')
  .replaceAll('}, {', '},{')
  .replaceAll('  ', ' ')
  .replaceAll(': ', '": "')
  .replaceAll(', ', '", "')
  .replaceAll('}', '"}')
  .replaceAll('{', '{"')
p = JSON.parse(p)
// console.log(p)

$(document).ready(function () {
  $('body').css('opacity', 1)
})
$(function () {
  removePhoto()
  calculateTotals()
  justify()
})

$(function getImage () {
  $('tr').each(function () {
    $(this).click(function () {
      let photo = $(this).find('td').eq(11).text().trim('\n')
      let path = $(this).find('td').eq(1).text().trim('\n')
      let img = 'static/images/parent/' + path + '/800/' + photo
      if (photo == 'None') {
        img = 'static/images/error4.svg'
      }
      $('.basket').css('background-image', 'url(' + img + ')')
    })
  })
})

const flashTime = 3000
var pcsSelected
var totalSelected
var activeColor = '#b2ffe3'
var basketIcon = '../static/images/basket.svg'
var checks = document.querySelectorAll('.basket-checkbox')
var tr = document.querySelectorAll('tr')

var headers = [
  'brand',
  'styleid',
  'category',
  'color',
  'size',
  'price',
  'discount',
  'promo',
  'customerDiscount',
  'qty',
  'sign'
]

var fields = ['styleid', 'color', 'size', 'price', 'discount', 'promo']
h_length = headers.length
let obj = []
const Cook = getCookies()
var thisPhone = {}
thisPhone['phone'] = Cook.phone
thisPhone['Session'] = Cook.Session

function calcSelected () {
  let inv = []
  let selected = {}
  let orderTotal = 0
  let index
  $('.basket-checkbox').each(function () {
    if ($(this).is(':checked')) {
      let product = {}
      let $parent = $(this).closest('tr')
      index = headers.indexOf('styleid')
      let styleid = $.trim($parent.find('td').eq(index).text())
      for (pr in p) {
        if (p[pr].модель == styleid) {
          product.styleid = p[pr].модель
          product.color = p[pr].цвет
          product.size = p[pr].размер
          product.price = parseInt(p[pr].цена)
          product.discount = parseFloat(p[pr].скидка)
          product.promo = parseFloat(p[pr].промо)
          product.qty = parseInt($parent.find('input').val())
          product.total = parseInt(
            product.price *
              (1 - product.discount) *
              (1 - product.promo) *
              product.qty
          )
          orderTotal += product.total
          inv.push(product)
        }
      }
    }
  })
  thisPhone.orderTotal = orderTotal
  thisPhone.procName = 'ON_SITE RESERVATION'
  inv.unshift(thisPhone)
  return inv
}

tr.forEach(el => {
  el.addEventListener('click', function (e) {
    tr.forEach(element => {
      element.style.backgroundColor = ''
    })
    el.style.backgroundColor = activeColor
  })
  el.addEventListener('dblclick', function (e) {
    let obj = {}
    el.style.backgroundColor = activeColor
    le = el.children.length
    for (let i = 0; i < le; i++) {
      if (fields.includes(headers[i])) {
        obj[headers[i]] = el.children.item(i).innerText
      }
    }
    openProductPage(obj)
  })
})

$('#delivery option').each(function () {
  $('#delivery').parent().css('background-color', 'var(--redBack)')
  $('.address-warning').css('display', 'block')
  let value = $(this).val()
  let search = window.location.search.split('=')
  $option = search.slice(1)[0]
  if ($.isNumeric($option)) {
    console.log($option, 'this is the adrr')
    $('#delivery').val($option)
    $('.address-warning').hide()
    $('#delivery').parent().css('background-color', 'var(--greenBack)')
    return false
  } else if ($.isNumeric(value) && value > 0) {
    console.log(value)
    $('#delivery').val(value)
    $('.address-warning').hide()
    $('#delivery').parent().css('background-color', 'var(--greenBack)')
    return false
  }
})

function selectAll () {
  checks.forEach(function (item) {
    item.checked = true
  })
  calculateTotals()
  $('tr').css({ backgroundColor: '' })
  $('.basket').css('background-image', 'url(' + basketIcon + ')')
}

function clearSelected () {
  checks.forEach(function (item) {
    item.checked = false
  })
  calculateTotals()
  $('tr').css({ backgroundColor: '' })
  $('.basket').css('background-image', 'url(' + basketIcon + ')')
}

function openProductPage (arg) {
  window.location.href = '/product2/' + arg.styleid + '?' + 'color=' + arg.color
}

function buySelected () {
  let delivery = $('#delivery option:selected')
  if (Cook.phone == undefined) {
    flashMessage(
      'Чтобы делать покупки авторизуйтесь в личном кабинете',
      true,
      flashTime
    )
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
  if (inv.error) {
    flashMessage(inv.error, false, flashTime)
    return false
  }
  promissed = basketActions(inv)
  promissed.done(function (data, state) {
    if (state == 'success') {
      console.log(data)
      if (!data.error) {
        flashMessage('Товар зарезервирован. Переход к оплате', true, flashTime)
        window.location.href = data
      } else {
        flashMessage(data.error, false, flashTime)
        window.location.href = '/basketS'
      }
    }
    console.log(data, state)
  })
}

function readyToBuy () {
  let checked = false
  if (Cook.phone == undefined) {
    flashMessage(
      'Чтобы делать покупки авторизуйтесь в личном кабинете',
      false,
      flashTime
    )
    return false
  }
  $('.basket-checkbox').each(function () {
    if ($(this).is(':checked')) {
      checked = true
    }
  })
  if (checked == false) {
    flashMessage('Нужно отметить то, что вы хотите купить', false, flashTime)
    return false
  }
  let delivery = $('#delivery option:selected')
  if (delivery.val() == 'choose address') {
    flashMessage('нужно выбрать способ доставки')
    return
  }
  $('.main-message').slideDown(500).css('display', 'flex')
  $('.cell-basket').css('opacity', '0.2')
  let toPay = $('#toPay').text()
  console.log(toPay, ' this is toPay')
  let pcs = $('#qty').text()
  $('#buy-qty').text(pcs)
  $('#buy-amount').text(toPay)
}

$('#cancel').click(function () {
  $('.main-message').slideUp(500).css('display', 'none')
  $('.cell-basket').css('opacity', '1')
})

$('.pmt-logo').each(function () {
  $(this).click(function () {
    let pmtSys = $(this).attr('id')
    if (pmtSys == 'yandex') {
      pmtSys = 'tinkoff'
    }
    thisPhone.pmtSys = pmtSys
    buySelected()
  })
})

function removeSelected () {
  let action = 'remove'
  thisPhone.procName = action
  thisPhone.uuid = Cook.Session
  let inv = selected('hide')
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

function selected (action) {
  ;(pcsSelected = 0), (totalSelected = 0)
  let obj1 = []
  checks.forEach(function (item) {
    if (item.checked) {
      let obj = {}
      el = item.closest('tr')
      for (let i = 0; i < h_length; i++) {
        if (fields.includes(headers[i])) {
          obj[headers[i]] = el.children
            .item(i)
            .innerText.replaceAll('%', '')
            .replaceAll(',', '')
            .replaceAll('-', '')
        }
      }
      let qty = parseInt(el.children.item(8).children[1].value)
      obj.qty = qty
      console.log(qty, 'obj.qty')
      obj.discount = obj.discount / 100
      obj.promo = obj.promo / 100
      obj.total = qty * obj.price * (1 - obj.discount) * (1 - obj.promo)
      totalSelected += obj.total
      pcsSelected += qty
      obj1.push(obj)
    }
  })
  if (obj1.length == 0) {
    return {
      error: 'nothing selected'
    }
  }
  return obj1
}

function deliveryAction () {
  var value = $('#delivery').val()
  console.log(value)
  // if (value == 'new-address') {
  if (value == 0) {
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

$(function () {
  $('.basket-checkbox').on('click', function () {
    calculateTotals()
  })
})

function removePhoto () {
  $('tr').each(function (index) {
    if (index == 0) {
      $(this).find('.table-cell').eq(11).hide()
    } else {
      $(this).find('td').eq(11).hide()
    }
  })
}

// this function iterates throug the rows of a table and returns total
function calculateTotals () {
  $(function () {
    let region = 'en-US'
    var sum = 0
    var pieces = 0
    var sumChecked = 0
    let discount, promo
    //iterate through each row in the table
    $('tr').each(function (index) {
      $price = parseInt(
        $(this).find('td').eq(5).text().replaceAll(',', '').replaceAll(' ', '')
      )
      let fmt = $price.toLocaleString(region, { maximumFractionDigits: 0 })
      $(this).find('td').eq(5).text(fmt)
      $qty = $(this).find('.counter').val()

      discount = parseFloat($(this).find('td').eq(6).text().trim('\n'))
      discount = isNaN(discount) ? 0 : discount / 100
      promo = parseFloat($(this).find('td').eq(7).text().trim('\n'))
      promo = isNaN(promo) ? 0 : promo / 100
      $checked = $(this).find('.basket-checkbox').is(':checked')
      if ($.isNumeric($price) && $.isNumeric(promo) && $.isNumeric(discount)) {
        let delta = $price * $qty * (1 - promo) * (1 - discount)
        let deltaChecked = $checked ? delta : 0
        let piecesChecked = $checked ? $qty : 0
        let fmt = delta.toLocaleString(region, {
          maximumFractionDigits: 0
        })
        $(this).find('td').eq(9).text(fmt)
        sum += delta
        pieces += parseInt(piecesChecked)
        sumChecked += deltaChecked
      }
    })
    let fmt =
      sum.toLocaleString(region, {
        maximumFractionDigits: 0
      }) + ' руб'
    $('#total').text(fmt)
    let fmtChecked =
      sumChecked.toLocaleString(region, {
        maximumFractionDigits: 0
      }) + ' руб'
    $('#toPay').text(fmtChecked)
    $('#qty').text(pieces)
  })
}

// to justify the row in table , numbers and text
function justify () {
  $('tr').each(function (index) {
    if (index > 0) {
      for (let i = 5; i < 10; i++) {
        $(this).find('.table-cell').eq(i).css({
          'text-align': 'right'
        })
      }
    }
  })
}

// this function is to record changes to basket when + or - is clicked
function submitChanges () {
  newObj = []
  console.log(newObj)
  thisPhone.action = 'submit'
  newObj.push(thisPhone)
  $('tr').each(function (index) {
    if (index > 0) {
      let test = {}
      $qty = $(this).find('.counter').val()
      $styleid = $(this).find('td').eq(1).text().trim('\n')
      $color = $(this).find('td').eq(3).text().trim('\n')
      $size = $(this).find('td').eq(4).text().trim('\n')
      test.styleid = $styleid
      test.color = $color
      test.size = $size
      test.qty = $qty
      newObj.push(test)
    }
  })
  console.log(newObj)
}
