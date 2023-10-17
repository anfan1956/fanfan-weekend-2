p = p
  .replaceAll('&#39;', '')
  .replaceAll('}, {', '},{')
  .replaceAll('  ', ' ')
  .replaceAll(': ', '": "')
  .replaceAll(', ', '", "')
  .replaceAll('}', '"}')
  .replaceAll('{', '{"')

p = JSON.parse(p)
// console.log(p)

function sort_by_cat () {
  let x = document.getElementById('criteria-select').value
  // console.log('selected: ' + x)
  let checklist = ['бренд', 'категория', 'цена', 'скидка']
  p = sortData(p, x)
  const criteria = cr_list(x)
  if (checklist.includes(x)) {
    render(x, criteria)
  }
}

function cr_list (y) {
  let criteria = []
  if (y == 'бренд') {
    criteria = p.map(({ бренд }) => бренд)
  } else if (y == 'категория') {
    criteria = p.map(({ категория }) => категория)
  } else if (y == 'цена') {
    criteria = p.map(({ цена }) => цена)
  } else if (y == 'скидка') {
    criteria = p.map(({ скидка }) => скидка)
  }
  criteria = [...new Set(criteria)]
  // console.log(criteria)

  return criteria
}

function sortData (data, byKey) {
  let sortedData
  if (byKey == 'бренд') {
    sortedData = data.sort(function (a, b) {
      let x = a.бренд.toLowerCase()
      let y = b.бренд.toLowerCase()
      if (x > y) {
        return 1
      }
      if (x < y) {
        return -1
      }
      return 0
    })
  } else if (byKey == 'категория') {
    sortedData = data.sort(function (a, b) {
      let x = a.категория.toLowerCase()
      let y = b.категория.toLowerCase()
      if (x > y) {
        return 1
      }
      if (x < y) {
        return -1
      }
      return 0
    })
  } else if (byKey == 'цена') {
    sortedData = data.sort(function (a, b) {
      let x = parseInt(a.цена)
      let y = parseInt(b.цена)
      if (x > y) {
        return 1
      }
      if (x < y) {
        return -1
      }
      return 0
    })
  } else if (byKey == 'скидка') {
    sortedData = data.sort(function (a, b) {
      let x = parseFloat(a.скидка)
      let y = parseFloat(b.скидка)
      if (x < y) {
        return 1
      }
      if (x > y) {
        return -1
      }
      return 0
    })
  } else {
    sortedData = data
  }
  return sortedData
}

function render (x, y) {
  let el = document.getElementById('container')
  removeAllChildNodes(el)
  const container = document.getElementById('container')
  y.forEach(item => {
    let crit_list = document.createElement('p')
    crit_list.classList.add('criteria')
    if (x == 'скидка') {
      let disc = 'Скидка ' + parseFloat(item * 100).toFixed(0) + '%'
      crit_list.innerText = disc
    } else if (x == 'цена') {
      let price =
        'Цена ' +
        parseInt(item).toLocaleString('en-US', {
          minimumFractionDigits: 0
        }) +
        ' руб.'
      crit_list.innerText = price
    } else {
      crit_list.innerText = item
    }
    console.log(x, item, ': sort item')

    container.appendChild(crit_list)

    let wrapper = document.createElement('div')
    wrapper.classList.add('wrapper')
    p.forEach(element => {
      if (x == 'бренд') {
        if (element.бренд == item) {
          populate(element, wrapper)
        }
      } else if (x == 'категория') {
        if (element.категория == item) {
          populate(element, wrapper)
        }
      } else if (x == 'цена') {
        if (element.цена == item) {
          populate(element, wrapper)
        }
      } else if (x == 'скидка') {
        if (element.скидка == item) {
          populate(element, wrapper)
        }
      }
    })
  })
}

function populate (element, wrapper) {
  let details = [
    'артикул: ' + element.артикул,
    'модель: ' + element.модель,
    'цена: ' + element.цена,
    'скидка: ' + element.скидка
  ]
  let cell = document.createElement('div')
  let brand = document.createElement('div')
  let item_title = document.createElement('p')
  let photo = document.createElement('a')
  let image = document.createElement('img')

  cell.classList.add('cell')
  image.classList.add('image')
  brand.innerHTML = `<p class = "brand-title">${element.бренд}, <span style="
    text-transform:lowercase;
    font-weight:300;
    ">${element.категория}</span> </p>`
  // photo.href = '/product/' + element.модель  - original ref
  photo.href = '/product2/' + element.модель
  image.src = parent + element.модель + '/540/' + element.фото
  container.appendChild(wrapper)
  wrapper.appendChild(cell)
  cell.appendChild(brand)
  cell.appendChild(photo)
  photo.appendChild(image)
  if (element.скидка > 0) {
    let discount = document.createElement('div')
    discount.classList.add('discount')
    discount.innerText = ' - ' + formatAsPercent(element.скидка * 100, 0)
    cell.appendChild(discount)
  }
  if (element.промо_скидка > 0) {
    let promo_discount = document.createElement('div')
    promo_discount.classList.add('promo-discount')
    promo_discount.innerText =
      ' - ' + formatAsPercent(element.промо_скидка * 100, 0)
    cell.appendChild(promo_discount)
  }

  let detail = document.createElement('div')
  let allDetails = ''
  details.forEach(item => {
    const html = `<p class = "details">${item}</p>`
    allDetails += html
  })
  detail.innerHTML = allDetails
  cell.appendChild(detail)
}

function removeAllChildNodes (parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild)
  }
}

function formatAsPercent (num, digs) {
  return `${parseFloat(num).toFixed(digs)}%`
}

$(document).ready(function () {
  // this function filters brand
  $('#brand').on('change', function () {
    let criteria = $(this).val()
    $('.brand-wrapper').show()
    $('.criteria').each(function () {
      if (criteria == 'brand') {
        return false
      }
      if ($(this).text() != criteria) {
        $(this).closest('div').hide()
      } else {
        $(this).closest('div').show()
      }
    })
  })

  //   this function filters category
  $('#category').on('change', function () {
    let criteria = $(this).val()
    console.log(criteria)
    if (criteria == 'category') {
      $('.criteria').show()
    } else {
      $('.criteria').hide()
    }
    $('.cell').show()
    $('.criteria').each(function () {
      $(this).closest('.cell').show()
    })
    $('.cat').each(function () {
      if (criteria == 'category') {
        return false
      }
      if ($(this).text() != criteria) {
        $(this).closest('.cell').hide()
      } else {
        $(this).closest('.cell').show()
      }
    })
  })
})
