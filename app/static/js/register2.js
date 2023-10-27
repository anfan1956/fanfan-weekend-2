/* 
    stages for processing the registration
    0 - nothing is defined
    1 - phone entered
        wrong number - 
            message - 
            return to 0

    2 - sms entered 
        wrong number -
            message
            return to 1
            
            3 - email entered
        wrong - 
        message
        return to 2
        
    4 - email code is entered
    wrong 
            message
            return to 3
            
    5 - preferences updated
    
    if coockie exists then 
    2 - as if sms message is correct
    */

var screenMode
if (window.matchMedia('(max-width: 768px)').matches) {
  screenMode = 'smartphone'
} else {
  screenMode = 'desktop'
}
let search = searchParams()
var orderid = search.orderid
var uuid = search.uuid

function searchParams () {
  var params = window.location.search
  if (params) {
    params =
      '{"' +
      params.replace(/\?/gi, '').replace(/\&/gi, '","').replace(/\=/gi, '":"') +
      '"}'
    params = JSON.parse(params)
  } else {
    params = {}
  }
  return params
}

function renderPaymentSuccess (orderid) {
  $('.auth-login').empty()
  $('.row').empty()
  orderDetails2(orderid)
}

var phone,
  mode,
  flashTime = 2000
// var data = {}
$(document).ready(function () {
  if (orderid != undefined) {
    let thisSession = objCookies().Session
    if (uuid == thisSession) {
      renderPaymentSuccess(orderid)
      return false
    } else {
      flashMessage(
        'чтобы получить доступ к информации о заказх, пройдите авторизацию',
        false,
        flashTime
      )
    }
  }
  phone = objCookies().phone
  if (phone == undefined) {
    mode = 0
  } else {
    mode = 2
    $('#phone-span').text(phoneString(phone))
    ajaxData.phone = phone
    ajaxData.requestMail = true
    ajaxData.mode = mode
    promissed = registerData(ajaxData)
    promissed.done(function (data, state) {
      if (state == 'success') {
        $('#email').val(data.email).prop('disabled', true)
        // console.log(data)
        getPrefs(data)
      }
    })
  }
  selectConf(mode)
  $('#phone').keypress(function (e) {
    if (e.which === 13) {
      $('#btn1').click()
    }
  })
  $('#sms-code').keypress(function (e) {
    if (e.which === 13) {
      $('#btn2').click()
    }
  })

  $('#change-phone').click(function () {
    resetPhoneCoockie()
    location.reload(true)
  })

  $('#btn1').click(function () {
    phone = thePhone($('#phone').val())
    $('#phone-span').text(phoneString(phone))
    $('#sms-wrap').show()
    $(this).hide()
    ajaxData.phone = phone
    ajaxData.mode = 0
    registerData(ajaxData)
  })

  $('#btn2').click(function () {
    ajaxData.sms_entered = $('#sms-code').val()
    ajaxData.mode = 2
    promissed = registerData(ajaxData)
    promissed.done(function (data, state) {
      if (state == 'success') {
        console.log('btn2 click: ', data) //убрать после доработки

        if (!data.error) {
          $('#email').val(data.email).prop('disabled', true)
          let flMessage = 'Вы авторизованы.'
          let phoneStr = phoneString(phone)
          $('.item-menu-right').show().text(phoneStr)
          $('#incognito').css('display', 'none')
          if (data.promo) {
            // flMessage += ' На ваш телефон отправлен промокод ' + data.promo
            flMessage += ' Промо-скидки будут учтены автоматически'
          }
          flashMessage(flMessage, true, flashTime)
          getPrefs(data)
        } else {
          flashMessage('Неверный код СМС', false, flashTime)
          setTimeout(() => {
            location.reload(true)
          }, 5000)
        }
      }
      selectConf(data.mode)
    })
  })

  $('#change-mail').click(function () {
    mode = 3
    $(this).hide()
    selectConf(mode)
  })

  $('#mail-submit').click(function () {
    if ($('#email').val() == '') {
      $('#email').val('почта не зарегистрирована')
      console.log(changeMail((deleteMail = true)))
      promissed = registerData(changeMail((deleteMail = true)))
      return
    } else {
      console.log('else')

      $('#email-code-wrap').show()
      $(this).hide()
      $('#email-code').focus()
      promissed = registerData(changeMail((deleteMail = false)))
    }
  })

  $('#btn3').click(function () {
    promissed = registerData(emailCode())
    promissed.done(function (data, state) {
      if (state == 'success') {
        if (!data.error) {
          flashMessage('почта обновлена', true, flashTime)
          mode = 2
          selectConf(mode)
          $('#email').prop('disabled', true)
        } else {
          flashMessage(data.error, false, flashTime)
        }
      }
    })
  })

  $('#prefs').click(function () {
    let location = objCookies().currentLocation
    if (location) {
      window.location.href = location
      return
    } else {
      window.location.href = '/promo'
      console.log('no location defined')
    }
  })
  $('.checkboxes').each(function () {
    $(this).change(function () {
      promissed = registerData(prefsUpdate())
      promissed.done(function (data, state) {
        if (state == 'success') {
          if (!data.error) {
            flashMessage('настройки оповещений записаны', true, flashTime)
          } else {
            flashMessage(data.error, false, flashTime)
          }
        }
      })
    })
  })
})

$('#history').click(function () {
  let text = $(this).text()
  if (text == 'ваши заказы') {
    checkOrders()
  } else {
    $('.orders').empty()
    $('#history').text('ваши заказы')
  }
})

function checkOrders () {
  phone = objCookies().phone
  let phoneData = {
    phone: phone,
    procName: 'customer_orders_json'
  }
  // console.log('clicked checkOrders, phone: ', phoneData)
  promissed = registerData(phoneData, 'customer_orders')
  promissed.done(function (data, state) {
    if (state == 'success') {
      console.log(data)
      if (screenMode == 'smartphone') {
        for (let d in data) {
          delete data[d].время
          let date = data[d].дата
          date = date.slice(0, 6) + date.slice(-2)
          data[d].дата = date
        }
      }
      ordersTable(data)
    }
  })
}
function ordersTable (data) {
  let parent = $('.orders')
  $('#history').text('скрыть заказы')
  parent.empty()
  let html = ''
  html += '<table id = "orders-table" class="orders-table">'
  let message =
    'Кликните на строку с номером заказа, чтобы увидеть детали заказа'
  html += '<caption> <i>' + message + '</i> </caption>'
  html += '<tr class= "tabHeader">'
  let colNames = Object.keys(data[0])
  for (let c in colNames) {
    html += '<th>' + colNames[c] + '</th>'
  }
  html += '</tr>'
  for (let d in data) {
    html += '<tr class ="table-rows">'
    let row = Object.values(data[d])
    for (let i in row) {
      html += '<td>' + row[i] + '</td>'
    }
    html += '</tr>'
  }
  html += '</table>'
  parent.append(html)
  $('tr').click(function () {
    let orderid = $(this).find('td').eq(0).text()
    // orderDetails(orderid)
    orderDetails2(orderid)
  })
}

function orderDetails2 (arg) {
  let theOrder = arg
  $('.order-details').css('display', 'flex').append(theOrder)
  $('.auth-login').css('opacity', '.2')
  let orderid = {
    orderid: arg,
    phone: phone,
    procName: 'order_details_delivery_json',
    Session: objCookies().Session
  }
  // console.log(orderid)
  promissed = registerData(orderid, 'customer_orders')
  promissed.done(function (data, state) {
    if (state == 'success') {
      if (screenMode == 'desktop') {
        detailsCombinedTable(data, orderid.orderid)
      } else {
        detailsCombinedTable2(data, orderid.orderid)
      }
    }
  })
}
function detailsCombinedTable (data, orderid) {
  // console.log(data)
  let parent = $('.order-details')
  parent.empty()
  let html =
    '<h1 class = "common">Благодарим за покупку! (хоть и не Jessica :) )</h1>'
  html += '<p>Сохраните номер заказа и код для получения товара</p>'
  parent.append(html)
  // let html = '<p class = "common">ИНФОРМАЦИЯ О ЗАКАЗЕ</p>'

  let order = data[0].order_composition // order - first part of json data
  // console.log('order: ', order)
  const total = order.reduce((current, order) => {
    return order.стоимость + current
  }, 0)
  // console.log('order total: ', total)

  html = ''
  html += '<table id = "order-details-table" class="order-details-table">'
  let message = 'Детализация заказа №' + orderid
  html += '<caption> <i>' + message + '</i> </caption>'
  html += '<tr class= "tabHeader">'
  let colNames = Object.keys(order[0])
  for (let c in colNames) {
    html += '<th>' + colNames[c] + '</th>'
  }
  html += '</tr>'
  for (let d in order) {
    html += '<tr class ="table-details-rows">'
    let row = Object.values(order[d])
    for (let i in row) {
      let value = row[i]
      if (i == [row.length - 1]) {
        value = parseInt(row[i]).toLocaleString('en-US') + ' руб.'
      }
      html += '<td>' + value + '</td>'
    }
    html += '</tr>'
  }
  html += '</table>'
  parent.append(html)
  html =
    '<h1>Сумма заказа: ' +
    parseInt(total).toLocaleString('en-US') +
    ' руб.</h1><br>'
  parent.append(html)

  let delivery = data[0].delivery // deliver - second part of json data
  // console.log('delivery: ', delivery)
  html = '<h1>Информация о доставке</h1>'
  colNames = Object.keys(delivery[0])
  let dataValues = Object.values(delivery[0])
  for (let d in colNames) {
    if (colNames[d] == 'телефон получателя') {
      dataValues[d] = phoneString(dataValues[d])
    }
    html +=
      '<p><strong>' + colNames[d] + ':&nbsp;</strong> ' + dataValues[d] + '</p>'
    // console.log(colNames[d], ': ', dataValues[d])
  }
  parent.append(html)

  var $button = $('<button class="btn-cancel">Закрыть</button>')
  $('.order-details').append($button)
  $button.click(function () {
    $('.order-details').empty()
    $('.order-details').css('display', 'none').empty
    $('.auth-login').css('opacity', '1')
  })
}
function detailsCombinedTable2 (data, orderid) {
  console.log(data)
  let parent = $('.order-details')
  parent.empty()
  let html = '<p class = "common">ИНФОРМАЦИЯ О ЗАКАЗЕ SM</p>'

  let order = data[0].order_composition // order - first part of json data
  console.log('order: ', order)
  const total = order.reduce((current, order) => {
    return order.стоимость + current
  }, 0)
  console.log('order total: ', total)

  for (let d in order) {
    delete order[d].артикул
    delete order[d].цвет
    delete order[d].баркод
  }

  html = ''
  html += '<table id = "order-details-table" class="order-details-table">'
  let message = 'Детализация заказа №' + orderid
  html += '<caption> <i>' + message + '</i> </caption>'
  html += '<tr class= "tabHeader">'
  let colNames = Object.keys(order[0])
  for (let c in colNames) {
    html += '<th>' + colNames[c] + '</th>'
  }
  html += '</tr>'
  for (let d in order) {
    html += '<tr class ="table-details-rows">'
    let row = Object.values(order[d])
    for (let i in row) {
      let value = row[i]
      if (i == [row.length - 1]) {
        value = parseInt(row[i]).toLocaleString('en-US') + ' руб.'
      }
      html += '<td>' + value + '</td>'
    }
    html += '</tr>'
  }
  html += '</table>'
  parent.append(html)
  html =
    '<h1 class= "smartphone">Сумма: ' +
    parseInt(total).toLocaleString('en-US') +
    ' руб.</h1><br>'
  parent.append(html)

  let delivery = data[0].delivery // deliver - second part of json data
  console.log('delivery: ', delivery)
  html = '<h1 class = "smartphone">Информация о доставке</h1>'
  colNames = Object.keys(delivery[0])
  let dataValues = Object.values(delivery[0])
  for (let d in colNames) {
    if (colNames[d] == 'телефон получателя') {
      dataValues[d] = phoneString(dataValues[d])
    }
    html +=
      '<div class = "p-smartphone"><strong>' +
      colNames[d] +
      ':&nbsp;</strong> ' +
      dataValues[d] +
      '</div>'
    // console.log(colNames[d], ': ', dataValues[d])
  }
  parent.append(html)

  var $button = $('<button class="btn-cancel">Закрыть</button>')
  $('.order-details').append($button)
  $button.click(function () {
    $('.order-details').empty()
    $('.order-details').css('display', 'none').empty
    $('.auth-login').css('opacity', '1')
  })
}

function getPrefs (arg) {
  $('input[type=checkbox]').each(function () {
    var d = arg.length
    for (var d in arg) {
      if (d == $(this).prop('name')) {
        $(this).prop('checked', arg[d])
        // console.log(d, arg[d])
      }
    }
    // console.log($(this).prop('name'), data.promos)
  })
}

function selectConf (mode) {
  switch (mode) {
    case 0:
      $('#email-group').hide()
      $('#mail-prefs').hide()
      $('#sms-wrap').hide()
      $('#change-phone').hide()
      break

    case 2:
      $('#email-group').show()
      $('#change-phone').show()
      $('#change-mail').show()
      $('#prefs').show()
      $('#sms-wrap').hide()
      $('#email-code-wrap').hide()
      $('#mail-submit').hide()
      $('#btn1').hide()
      $('.row').hide()
      $('#mail-prefs').show()
      break

    case 3:
      $('#email').val('').prop('disabled', false).focus()
      $('#mail-submit').show()
      $('#change-phone').hide()
      $('#prefs').hide()
      break

    case 4:
      break

    default:
      break
  }
}

function registerData (arg, theUrl = 'register2') {
  console.log("from proc 'registerData'", arg, theUrl)

  return $.ajax({
    type: 'POST',
    url: theUrl,
    data: JSON.stringify(arg),
    // data: arg,
    contentType: 'application/json',
    dataType: 'json'
  })
}

function changeMail (deleteMail) {
  console.log('deleteMail = ', deleteMail)

  let changeMailData = {
    mode: 3,
    phone: thePhone($('#phone-span').text())
  }
  if (deleteMail == false) {
    changeMailData.email = $('#email').val()
  } else {
    deleteMessage = 'delete email'
    changeMailData.mode = 2
    changeMailData.deleteEmail = deleteMessage
  }
  return changeMailData
}

function emailCode () {
  let emailCodeData = {
    mode: 4,
    phone: thePhone($('#phone-span').text()),
    email: $('#email').val(),
    code: $('#email-code').val()
  }
  return emailCodeData
}

function prefsUpdate (deleteMail = false) {
  let prefData = {
    phone: thePhone($('#phone-span').text())
  }
  if (deleteMail == false) {
    ;(prefData.mode = 5),
      (prefData.receipts = $('#receipts').prop('checked')),
      (prefData.collections = $('#collections').prop('checked')),
      (prefData.sales = $('#sales').prop('checked')),
      (prefData.promos = $('#promos').prop('checked'))
  } else {
    prefData.deleteMail = deleteMail
  }
  return prefData
}

function resetPhoneCoockie () {
  document.cookie = 'phone' + '=; expires=Thu, 01-Jan-70 00:00:01 GMT;'
  document.cookie = 'promo' + '=; expires=Thu, 01-Jan-70 00:00:01 GMT;'
  document.cookie =
    'currentLocation' + '=; expires=Thu, 01-Jan-70 00:00:01 GMT;'
  document.cookie = 'Session=newSession;max-age=3600;'
}
