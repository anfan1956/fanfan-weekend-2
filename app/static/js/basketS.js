const b = content
  .replaceAll('&#39;', '')
  .replaceAll('}, {', '},{')
  .replaceAll('  ', ' ')
  .replaceAll(': ', '": "')
  .replaceAll(', ', '", "')
  .replaceAll('}', '"}')
  .replaceAll('{', '{"')

// JSON.parse(content)
const basket = JSON.parse(b)
const flashTime = 3000
const Cook = getCookies()
var thisPhone = {}
thisPhone['phone'] = Cook.phone
thisPhone['Session'] = Cook.Session

$('.basket-checkbox').on('click', function () {
  calcSelected()
})

$('.pmt-logo').each(function () {
  $(this).click(function () {
    let pmtSys = $(this).attr('id')
    if (pmtSys == 'yandex') {
      pmtSys = 'tinkoff'
    }
    // thisPhone.pmtSys = pmtSys
    buySelected(pmtSys)
  })
})

function buySelected (pmtSys) {
  let order = calcSelected()
  let delivery = $('#delivery option:selected')
  order[0].phone = Cook.phone
  order[0].Session = Cook.Session
  order[0].pmtSys = pmtSys
  if ($.isNumeric(delivery.val())) {
    spotid = delivery.val()
    order[0].spotid = spotid
  } else {
    pickupid = delivery.val().split('-')[1]
    order[0].pickupid = pickupid
  }
  order[0].procName = 'ON_SITE RESERVATION'
  console.log(order, ' - from buySelected')
  promissed = basketActions(order)
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

function removeSelected () {
  let checked = false
  $('.basket-checkbox').each(function () {
    if ($(this).is(':checked')) {
      checked = true
    }
  })
  if (checked == false) {
    flashMessage('Нужно отметить то, что вы хотите удалить', false, flashTime)
    return false
  }

  let order = calcSelected()
  let delivery = $('#delivery option:selected')
  order[0].phone = Cook.phone
  order[0].Session = Cook.Session
  if ($.isNumeric(delivery.val())) {
    spotid = delivery.val()
    order[0].spotid = spotid
  } else {
    pickupid = delivery.val().split('-')[1]
    order[0].pickupid = pickupid
  }
  order[0].procName = 'remove'
  promissed = basketActions(order)
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
    $('#delivery').val(value)
    $('.address-warning').hide()
    $('#delivery').parent().css('background-color', 'var(--greenBack)')
    return false
  }
})

$('#delivery').on('change', function () {
  var value = $('#delivery').val()
  console.log(
    `deliveryAction #delivery.val(): ${value}`,
    value == 'choose address',
    value.length,
    'choose address'.length
  )
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
})

function selectAll (arg) {
  $('.basket-checkbox').each(function () {
    $(this).prop('checked', arg)
  })
  calcSelected()
}

function readyToBuy () {
  let checked = false
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
  $('.basket-container').css('opacity', '0.2')

  let toPay = $('#toPay').text()

  let pcs = $('#qty').text()
  $('#buy-qty').text(pcs)
  $('#buy-amount').text(toPay)
}

function openProductPage (arg) {
  window.location.href = '/product2/' + arg.styleid + '?' + 'color=' + arg.color
}
$('#cancel').click(function () {
  $('.main-message').slideUp(500).css('display', 'none')
  $('.basket-container').css('opacity', '1')
})

function calcSelected () {
  let inventory = []
  $('.basket-checkbox').each(function () {
    if ($(this).is(':checked')) {
      let product = {}
      let $parent = $(this).closest('.product')
      let qty = parseInt($parent.find('.qty').text().split(': ')[1])
      product.styleid = $parent.find('.model').text().split(': ')[1]
      product.color = $parent.find('.color').text().split(': ')[1]
      product.size = $parent.find('.size').text().split(': ')[1]
      product.qty = qty
      inventory.push(product)
    }
  })
  let thisOrder = purchaseOrder(inventory)

  var amount = thisOrder.map(o => o.total).reduce((x, y) => x + y, 0)
  var pcs = thisOrder.map(o => o.qty).reduce((x, y) => x + y, 0)

  let totals = {
    pcs: pcs,
    orderTotal: amount
  }
  thisOrder.unshift(totals)
  let toPay = amount.toLocaleString('en-US')
  pcs = pcs.toLocaleString('en-US')
  $('#toPay').text(toPay)
  $('#total').text(toPay)
  $('#qty').text(pcs)
  return thisOrder
}

function purchaseOrder (selection) {
  let order = []
  for (let j in selection) {
    for (let i in basket) {
      if (
        basket[i].модель == selection[j].styleid &&
        basket[i].размер == selection[j].size &&
        basket[i].цвет == selection[j].color
      ) {
        selection[j].price = parseInt(basket[i].цена)
        selection[j].discount = basket[i].скидка
        selection[j].promo = basket[i].промо
        selection[j].total = parseInt(
          basket[i].цена *
            (1 - basket[i].скидка) *
            (1 - basket[i].промо) *
            selection[j].qty
        )
        order.push(selection[j])
      }
    }
  }
  return order
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
  console.log(arg, ' - from basketActions')
  if (arg.error) {
    return arg
  }
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

$('.img').on('click', function () {
  let page = {}
  let color = $(this).closest('.product').find('.color').text().split(': ')[1]
  let styleid = $(this).closest('.product').find('.model').text().split(': ')[1]
  page.color = color
  page.styleid = styleid
  openProductPage(page)
})

function openProductPage (arg) {
  window.location.href = '/product2/' + arg.styleid + '?' + 'color=' + arg.color
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

//this function I did not write
function submitChanges () {
  console.log(newObj)
}
