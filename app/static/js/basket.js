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
function buySelected (inv, spotid, pickupid, orderTotal) {
  // calculateTotals()
  thisPhone.spotid = spotid
  thisPhone.pickupid = pickupid
  thisPhone.orderTotal = orderTotal
  thisPhone.procName = 'ON_SITE RESERVATION'
  // console.log(inv)
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

function calculateSelected (inv) {
  var bdata
  thisPhone.procName = 'calculate'
  // let inv = selected()
  // if (inv.error) {
  //   return inv
  // }
  // console.log(inv)

  promissed = basketActions(inv)
  promissed.done(function (data) {
    // document.querySelector('#toPay').innerHTML = data.toPay
    // $('#buy-amount').text(data.toPay)
    bdata = data
    console.log(data)
  })
  return bdata
}

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
      flashMessage('товар удален', true)
      console.log(data)
      setTimeout(() => {
        location.reload(true)
      }, 1500)
      // window.location.href = '/basket'
    }
  })
}

function selected (action) {
  let obj1 = []
  pcsSelected = 0
  totalSelected = 0
  checks.forEach(function (item) {
    if (item.checked) {
      var obj = {}
      el = item.closest('tr')
      for (let i = 0; i < h_length; i++) {
        if (fields.includes(headers[i])) {
          obj[headers[i]] = el.children.item(i).innerText.replaceAll(',', '')
        }
      }
      let qty = parseInt(el.children.item(8).children[1].value)
      obj.qty = qty
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
  // console.log(total)
  console.log(pcsSelected, totalSelected)
  return obj1
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
  // console.log('basket actions:', arg)
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
    let region = 'us'
    var sum = 0
    var pieces = 0
    var sumChecked = 0
    //iterate through each row in the table
    $('tr').each(function (index) {
      $price = parseInt(
        $(this).find('td').eq(5).text().trim('\n').replaceAll(',', '')
      )
      let fmt = $price.toLocaleString(undefined, { maximumFractionDigits: 0 })
      $(this).find('td').eq(5).text(fmt)
      $qty = $(this).find('.counter').val()
      $promo = parseFloat($(this).find('td').eq(7).text().trim('\n'))
      $checked = $(this).find('.basket-checkbox').is(':checked')
      if ($.isNumeric($price) && $.isNumeric($promo)) {
        let delta = $price * $qty * (1 - $promo)
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
  // $.ajax({
  //   type: 'POST',
  //   url: '/basket_actions',
  //   data: JSON.stringify(obj),
  //   contentType: 'application/json',
  //   dataType: 'json',
  //   success: function (data) {
  //     console.log(data)
  //     document.querySelector('#toPay').innerHTML = data.toPay
  //   }
  // })
  // })
}
