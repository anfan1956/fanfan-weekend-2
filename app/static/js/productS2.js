$(document).ready(function () {
  $('.close').on('click', function () {
    $('.my-modal').css('display', 'none')
    $('.product-container').css('opacity', 1)
  })
  $('#main').on('click', function () {
    $('.my-modal').css('display', 'block')
    $('.product-container').css('opacity', 0.1)
    console.log('not working')
  })
})
