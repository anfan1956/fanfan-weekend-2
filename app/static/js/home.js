var slDuration = 5000

$(document).ready(function () {
  $('.next').click(slideForward)
  $('.prev').click(slideBackwards)
  setTimeout(() => {
    autoContinue()
  }, slDuration)
})

function autoContinue () {
  slideForward()
  setTimeout(autoContinue, slDuration)
}

function slideForward () {
  var nextEl
  $('.slider').each(function () {
    var el = $(this)
    if (el.hasClass('active')) {
      nextEl = el.next()
      if (nextEl.length == 0) {
        nextEl = $('.slider').first()
      }
      el.removeClass('active')
    }
  })
  nextEl.addClass('active')
}

function slideBackwards () {
  var prevEl
  $('.slider').each(function () {
    var el = $(this)
    if (el.hasClass('active')) {
      prevEl = el.prev()
      if (prevEl.length == 0) {
        prevEl = $('.slider').last()
      }
      el.removeClass('active')
    }
  })
  prevEl.addClass('active')
}
