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

var slDuration = 5000
var slideTimer = void 0

function autoContinue () {
  nextSlide()
  setTimeout(autoContinue, slDuration)
}

function nextSlide () {
  clearInterval(slideTimer)
  var slideImg = $('.active')
  var nextImg = slideImg.next()
  if (nextImg.length) {
  } else {
    nextImg = $('.slider').first()
  }
  setTimeout(function () {
    slideImg.removeClass('active', 1000).css('z-index', -10)
    nextImg.addClass('active', 1000).css('z-index', 10)
  }, slDuration)
}
