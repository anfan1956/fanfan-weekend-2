if (window.matchMedia('(max-width: 768px)').matches) {
  console.log('switch to different location')
  let search = location.search
  let path = location.pathname.split('/')[2]
  window.location.href = '/productS2/' + path + search
  console.log(path + ', ' + location.search)
}
var data,
  items,
  mainColor,
  photo,
  images,
  styleid,
  water,
  size,
  spotid,
  deliveryData
var styleid, Cook, thisColor, search, alert_message, alert_general, product
var flashTime = 3000
const parent = '/static/images/parent/'
alert_message = $('.alert-message')
alert_general = $('.alert-general')
var spot_search = location.search

if (spot_search.split('=')[0] == '?spotid') {
  // var spotVal = 'spotid-' + spot_search.split('=')[1]
  var spotVal = spot_search.split('=')[1]
  deliveryData = {}
  deliveryData.spotid = spotVal
  // $('#delivery').val(spotVal)
  $('#basket-buy').trigger('click')
  console.log('sport_search spotVal:', spotVal)
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
    console.log(value)
    $('#delivery').val(value)
    $('.address-warning').hide()
    $('#delivery').parent().css('background-color', 'var(--greenBack)')
    return false
  }
})

$('#delivery').on('change', function () {
  deliveryData = {}
  var value = $(this).val().split('-')
  if (value[0] == 'pickup') {
    deliveryData.pickup = value[1]
  } else if (value[0] == 0) {
    let path = location.pathname
    console.log('path: ', path)

    window.location.href = '/delivery?' + path
    console.log(value, ' - will have to run new proc')
  } else {
    deliveryData.spotid = value[0]
  }
  console.log(deliveryData)
  console.log('spotid' in deliveryData, ' just checking')
  $('#pmt-link').trigger('click')
})

$(function () {
  search = window.location.search
  water = $('#watermark')
  data = allData.replaceAll('&#39;', '"')
  data = JSON.parse(data)
  styleid = data.styleid
  items = data.items
  images = data.images
  photo = data.photo
  Cook = getCookies()
  // console.log(Cook)

  mainColor = getMainColor()
  for (i in items) {
    if (items[i].color == mainColor) {
      render(mainColor, items[i])
    }
  }
  for (let k in images) {
    if (images[k].color == mainColor) {
      // console.log(images[k].color)
      $('.image-icons').each(function () {
        let source = $(this).attr('src')
        let thisImage = source.split('/').slice(-1)[0]
        if (thisImage == images[k].img) {
          $('#main').attr('src', source)
        }
      })
      break
    }
  }
  $('#btn-promo2').on('click', function () {
    window.location.href = '/register2'
  })
  let spotSearch = location.search.split('=')
  console.log(spotSearch)

  product = spotSearch[0].replace('?', '')
  if (product == 'spotid') {
    spotid = spotSearch[1]
    console.log('on document read: location.search', product, spotid)
    $('#delivery option[value=5]').prop('selected', 'selected')
  }
})

// procedure pick the color of main image from Flask rendering
// unless the page was redirected to from basket
// if it was then image clicked in basket becomes main
function getMainColor () {
  var mainColor = data.color
  if (search) {
    let x = search.split('?')[1].split('=')
    if (search.includes('?')) {
      if (x[0] == 'color') {
        mainColor = x[1].replaceAll('&#39;', '').replaceAll('%20', ' ')
      }
    }
  }
  return mainColor
}

function render (color, items) {
  let columns = $('.column')
  let colors = $('.color')
  let sizes = $('.sizes')
  let qtys = $('.quantities')
  columns.removeClass('col-color')
  colors.removeClass('active')
  colors.each(function () {
    if ($(this).text() == color) {
      $(this).addClass('active')
      sizes.each(function (index) {
        // console.log(items.qtys)
        items.qtys.forEach(element => {
          if (element.size == $(this).text()) {
            // console.log(element.size, $(this).text())

            columns.eq(index).addClass('col-color')
            qtys.eq(index).text(element.qty)
          }
        })
      })
    }
  })
  if (Cook.phone) {
    $('#btn-promo2').hide()
    promissed = getBasketContent()
    promissed.done(function (data) {
      // $('#this-qty').text(data.this)
      $('#this-qty').text('')
      $('#basket-total').text(data.total)
      let curr_size = $('#product-selected')
      let qtyBox = $('#quantity')
      curr_size.removeClass('filled')
      curr_size.val('')
      qtyBox.removeClass('filled')
      qtyBox.val('')
    })
  }
}

// select size and quantity for "one click" and for "add to basket"
// this proc have a response in a form of an object {"this": , "total":}
$('.column').click(function () {
  $('.sizes').removeClass('size_selected')
  $('.quantities').removeClass('size_selected')
  let column = $(this)
  size = column.find('.sizes').text()
  let qty = column.find('.quantities').text()
  let color = $('#colors').find('.active').text()

  let curr_size = $('#product-selected')
  let qtyBox = $('#quantity')
  curr_size.removeClass('filled')
  curr_size.val('')
  qtyBox.removeClass('filled')
  qtyBox.val('')
  if (column.hasClass('col-color')) {
    curr_size.val('Выбор: "' + color + '",  размер: ' + size)
    curr_size.addClass('filled')
    qtyBox.addClass('filled')
    $(this).find('.quantities').addClass('size_selected')
    $(this).find('.sizes').addClass('size_selected')
    thisColor = color
    qtyBox.val(1)
    let data = getItemData('sizeQuantities')
    // console.log(data, 'from getItemData')
    alreadyInBasket(data)
  }
})

// click on colors section to make color active
$('.color').click(function () {
  water.addClass('watermark')
  $('.sizes').removeClass('size_selected')
  $('.quantities').removeClass('size_selected')
  thisColor = $(this).text()
  items.forEach(function (el) {
    if (el.color == thisColor) {
      render(thisColor, el)
    }
  })
  for (let i in images) {
    let color = images[i].color
    let img = images[i].img
    if (color == thisColor) {
      let source = parent + styleid + '/800/' + img
      $('#main').attr('src', source)
      water.removeClass('watermark')
      break
    }
  }
})

// change active color and main picture
$('.image-icons').click(function () {
  let source = $(this).attr('src')
  let thisImage = source.split('/').slice(-1)[0]
  $('.sizes').removeClass('size_selected')
  $('.quantities').removeClass('size_selected')
  for (let i in images) {
    img = images[i].img
    if (img == thisImage) {
      thisColor = images[i].color
    }
  }
  colors = $('.color')
  colors.removeClass('active')
  colors.each(function () {
    if ($(this).text() == thisColor) {
      $(this).addClass('active')
    }
  })
  items.forEach(function (el) {
    if (el.color == thisColor) {
      render(thisColor, el)
      $('#this-qty').text('')
      let curr_size = $('#product-selected')
      let qtyBox = $('#quantity')
      curr_size.removeClass('filled')
      curr_size.val('')
      qtyBox.removeClass('filled')
      qtyBox.val('')
    }
  })
  $('#main').attr('src', source)
  water.removeClass('watermark')
})

// one click buy procedure
$('.basket-buy').click(function () {
  let fin_price
  if (sizeSelected()) {
    $('#current-size').text('размер: ' + size)
    $('#myModal').css('display', 'block')
    $('.product-container').css('opacity', '0.2')
    $('#one-click-qty').text('Количество: ' + $('#quantity').val())
    let final = parseInt(
      $('#final-price').text().split(' ')[0].replace(',', '').replace(' ', '')
    )
    if (product == 'spotid') {
      $('#delivery').val(spotid)
      console.log(spotid, product, ' before addr change')
      delSelect(spotid)
    }

    fin_price = $('#quantity').val() * final
    console.log('fin_price: ', fin_price)

    let final_price = fin_price.toLocaleString('us') + ' руб.'
    $('#final-price').text(final_price)

    $('#pmt-link').click(function () {
      arg = Cook.phone
      let thePhone = {}
      let inv = []
      if (deliveryData != undefined) {
        console.log('deliverData: ', deliveryData)
        thePhone.spotid = 'spotid' in deliveryData ? deliveryData.spotid : 0
        thePhone.pickupid = 'pickup' in deliveryData ? deliveryData.pickup : 0
        thePhone.orderTotal = fin_price
      } else {
        thePhone.spotid = $('#delivery').val()
      }
      let styleData = addStyleData(arg)
      styleData.qty = $('#quantity').val()
      styleData.total = fin_price
      thePhone.phone = arg
      thePhone.orderTotal = fin_price
      thePhone.Session = Cook.Session
      thePhone.procName = 'ONE_CLICK'
      console.log('style data:', styleData)
      inv[0] = styleData
      inv.unshift(thePhone)
      console.log('inv', inv)

      // paymentLink(styleData)
      // paymentLink(inv)
    })
    $('#back-to-shop').click(function (event) {
      event.preventDefault()
      $('#myModal').css('display', 'none')
      $('.product-container').css('opacity', '1')
    })
  }
})

$('.pmt-logo').each(function () {
  $(this).click(function () {
    let thePhone = {}
    let inv = []
    let fin_price
    let arg = Cook.phone
    let final = parseInt(
      $('#final-price').text().split(' ')[0].replace(',', '')
    )
    fin_price = $('#quantity').val() * final
    let styleData = addStyleData(arg)
    styleData.qty = $('#quantity').val()
    styleData.total = fin_price
    thePhone.spotid = $('#delivery').val()
    thePhone.phone = arg
    thePhone.orderTotal = fin_price
    thePhone.Session = Cook.Session
    console.log('style data:', styleData)
    inv[0] = styleData
    inv.unshift(thePhone)
    let pmtSys = $(this).attr('id')
    if (pmtSys == 'yandex') {
      pmtSys = 'tinkoff'
    }
    thePhone.procName = 'ONE_CLICK'
    thePhone.pmtSys = pmtSys
    // if (pmtSys == 'tinkoff') {
    console.log('inv', inv)
    paymentLink(inv)
    // }
  })
})

// add to basket procedure
$('#addBasket').click(function () {
  if (sizeSelected()) {
    let max = $('.quantities.size_selected').text() - $('#this-qty').text()
    let qtyAdded = $('#quantity').val()
    if (qtyAdded > max) {
      flashMessage('Превышено максимальное количество', false, flashTime)
      $('#quantity').val(0)
      return false
    }
    let data = getItemData('insert')
    let qty = data.qty
    // console.log(qty, ' added to basket')
    promissed = addToBasket(data)
    promissed.done(function (data) {
      if (data.error) {
        flashMessage(data.error)
        // alert_message.text(data.error)
        // alert_general.css('display', 'flex')
        return
      } else {
        flashMessage(`в корзину добавлено: ${qtyAdded} ед товара`, true)
        document.querySelector('#this-qty').innerHTML = data.this
        document.querySelector('#basket-total').innerHTML = data.total
      }
    })
  }
})

// close alert window button
$('.OK').click(function () {
  $('.product-container').css('opacity', '1')
  $('.alert-general').css('display', 'none')
})

// procedure checks if size is selected for to buy with one click or
// add to basket
function sizeSelected () {
  let time = 2500
  var Selected = $('#product-selected').val()
  if (Selected == '') {
    $('.product-container').css('opacity', '0.6')
    flashMessage('Выберите цвет и размер', false, time)
    setTimeout(function () {
      $('.product-container').css('opacity', '1')
    }, time)

    // $('.alert-message').text('Выберите цвет и размер')
    // $('.alert-general').css('display', 'flex')
    return false
  } else {
    return true
  }
}

//if phone or Session cookies get Basket data;
function getBasketContent () {
  user = {
    phone: Cook.phone,
    uuid: Cook.Session,
    procName: 'initialize'
  }
  let obj = [user]
  if (user.phone || user.uuid) {
    return $.ajax({
      type: 'POST',
      url: '/sortCodeQty',
      data: JSON.stringify(obj),
      //   data: user,
      contentType: 'application/json',
      dataType: 'json',
      success: function (data, state) {}
    })
  } else {
    $('#this-qty').text(0)
    $('#basket-total').text(0)
  }
}

// returns the data needed to run ajax request
function getItemData (proc) {
  user = {
    phone: Cook.phone,
    uuid: Cook.Session,
    procName: proc
  }
  // console.log(user, ' from getItemdata, user')
  item = {
    styleid: styleid,
    color: thisColor,
    size: size,
    qty: $('#quantity').val()
  }
  // console.log(item, ' from getItemdata, item')
  itemData = [user, item]
  return itemData
}

function addToBasket (arg) {
  return $.ajax({
    type: 'POST',
    url: '/goToBasket',
    data: JSON.stringify(arg),
    contentType: 'application/json',
    dataType: 'json'
  })
}

function getCookies () {
  let Cookies = {}
  if (document.cookie == '') {
    Cookies['cookies'] = 'no coockies'
  }
  document.cookie.split('; ').forEach(el => {
    el = el.replaceAll('"', '')
    c = el.split('=')
    Cookies[c[0]] = c[1]
  })
  return Cookies
}

function addStyleData (arg) {
  let b_data = new Object()
  b_data.color = thisColor
  b_data.size = size
  b_data.styleid = styleid
  b_data.price = data.price
  b_data.discount = data.discount
  b_data.promo = data.promo
  b_data.total = data.price * (1 - data.discount) * (1 - data.promo)
  // b_data.phone = arg
  // b_data.qty = 1
  return b_data
}

function paymentLink (args) {
  console.log('paymentLink args', args)

  data_str = JSON.stringify(args)
  $.ajax({
    type: 'POST',
    // url: '/oneClick',
    url: '/basket_actions',
    data: JSON.stringify(args),
    contentType: 'application/json',
    dataType: 'json',
    success: function (data, state) {
      window.location.href = data
      // console.log(data)
    },
    error: function (err) {
      console.log(err.responseText, ': error ', err) // <-- printing error message to console
    }
  })
}

function alreadyInBasket (arg) {
  $.ajax({
    type: 'POST',
    url: '/sortCodeQty',
    data: JSON.stringify(arg),
    contentType: 'application/json',
    dataType: 'json',
    success: function (data, state) {
      data = data == 'None' ? 0 : data
      // console.log(data)
      document.querySelector('#this-qty').innerHTML = data.this
      document.querySelector('#basket-total').innerHTML = data.total
    }
  })
}

$('#go-to-basket').on('click', function () {
  window.location.href = '/basket'
})
