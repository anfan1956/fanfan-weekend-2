function flashMessage (message, cat, time = 2000) {
  let frontColor = cat ? 'var(--greenForgr)' : 'var(--redForgr)'
  let backColor = cat ? 'var(--greenBack)' : 'var(--redBack)'
  $('.base-message')
    // .css('display', 'block')
    .text(message)
    .slideDown(300)
    .delay(time)
    .slideUp(300)
    .css('background-color', backColor)
    .css('border-color', frontColor)
    .css('color', frontColor)
  return
}

function flashConfirmation () {
  let spotid, pickupid
  let region = 'us'
  let inv = selected()
  console.log(
    inv,
    'flashConfirmation, function "selected()"',
    pcsSelected,
    totalSelected
  )
  if (inv.error) {
    flashMessage('Нужно отметить то, что вы хотите купить', false)
    return
  }
  let delivery = $('#delivery option:selected')
  if (delivery.val() == 'choose address') {
    flashMessage('нужно выбрать способ доставки')
    return
  }
  $('#buy-amount').text(
    totalSelected.toLocaleString(region, {
      maximumFractionDigits: 0
    })
  )
  $('#buy-qty').text(pcsSelected)

  $('.confirmation-message').slideDown(250)
  $('#cancel').click(function () {
    $('.confirmation-message').slideUp(250)
  })
  $('#make-payment').click(function () {
    $('.confirmation-message').slideUp(500)
    if ($.isNumeric(delivery.val())) {
      spotid = delivery.val()
    } else {
      pickupid = delivery.val().split('-')[1]
    }
    buySelected(inv, spotid, pickupid, totalSelected)
  })
}
