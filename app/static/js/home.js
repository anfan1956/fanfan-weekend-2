$(document).ready(function () {
  $('.next').on('click', function () {
    var curImg = $('.active')
    var nextImg = curImg.next()

    if (nextImg.length) {
    } else nextImg = $('.slider').first()

    curImg.removeClass('active').css('z-index', -10)
    nextImg.addClass('active').css('z-index', 10)
  })
  $('.prev').on('click', function () {
    var curImg = $('.active')
    var prevImg = curImg.prev()
    if (prevImg.length) {
    } else prevImg = $('.slider').last()
    curImg.removeClass('active').css('z-index', -10)
    prevImg.addClass('active').css('z-index', 10)
  })
  autoContinue()
})

var slDuration = 8000
var slideTimer = void 0

function autoContinue () {
  nextSlide()
  setTimeout(autoContinue, slDuration)
}

function nextSlide () {
  clearInterval(slideTimer)
  setTimeout(function () {
    let slideImg = $('.active')
    let nextImg = slideImg.next()
    if (nextImg.length) {
    } else nextImg = $('.slider').first()
    slideImg.removeClass('active', 2000).css('z-index', -10)
    nextImg.addClass('active', 3000).css('z-index', 10)
  }, slDuration)
}
