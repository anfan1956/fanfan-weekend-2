// referense how to JSON.parse in promo.js or in catalog.js
function thePhone (arg) {
  let tp = arg
    .replaceAll(' ', '')
    .replaceAll('-', '')
    .replace(/^8/, '')
    .replace(/^\+7/, '')
    .replaceAll('(', '')
    .replaceAll(')', '')
  return tp
}

function phoneString (arg) {
  let ni = '+7-' + thePhone(arg).replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
  return ni
  //   console.log(ni)
}
var n = '+7- (964) -763---34 65    '
console.log(thePhone(n), phoneString(n))
