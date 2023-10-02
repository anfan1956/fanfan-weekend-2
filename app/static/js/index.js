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
