var data, items, mainColor, photo, images, styleid, water, size
var styleid, Cook, thisColor, search, alert_message, alert_general
const parent = '/static/images/parent/'
alert_message = $('.alert-message')
alert_general = $('.alert-general')

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
  mainColor = getMainColor()
  for (i in items) {
    if (items[i].color == mainColor) {
      render(mainColor, items[i])
    }
  }
  for (let k in images) {
    if (images[k].color == mainColor) {
      console.log(images[k].color)
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

    console.log(data, 'from getItemData')

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
  // let thisColor, img
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
  if (sizeSelected()) {
    $('#current-size').text('размер: ' + size)
    $('#myModal').css('display', 'block')
    $('.product-container').css('opacity', '1')
    $('#pmt-link').click(function () {
      arg = Cook.phone
      let styleData = addStyleData(arg)
      styleData.location = '/promo'
      styleData.action = 'paymentLink'
      styleData.ticketid = 'null'
      styleData.qty = $('#quantity').val()
      styleData.pickup = 0
      paymentLink(styleData)
    })
    $('#back-to-shop').click(function (event) {
      event.preventDefault()
      $('#myModal').css('display', 'none')
    })
  }
})

// add to basket procedure
$('#addBasket').click(function () {
  if (sizeSelected()) {
    let data = getItemData('insert')
    promissed = addToBasket(data)
    promissed.done(function (data) {
      if (data.error) {
        flashMessage(data.error)
        // alert_message.text(data.error)
        // alert_general.css('display', 'flex')
        return
      } else {
        flashMessage(`в корзину добавлено: x ед товара`, true)
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
  item = {
    styleid: styleid,
    color: thisColor,
    size: size,
    qty: $('#quantity').val()
  }
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
  b_data.final = data.price * (1 - data.discount) * (1 - data.promo)
  b_data.phone = arg
  b_data.qty = 1
  return b_data
}

function paymentLink (args) {
  data_str = JSON.stringify(args)
  $.ajax({
    type: 'POST',
    url: '/oneClick',
    data: JSON.stringify(args),
    contentType: 'application/json',
    dataType: 'json',
    success: function (data, state) {
      window.location.href = data
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
      console.log(data)

      document.querySelector('#this-qty').innerHTML = data.this
      document.querySelector('#basket-total').innerHTML = data.total
    }
  })
}
