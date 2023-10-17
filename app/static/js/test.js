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
const format = num =>
  String(num).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,')
// function addCommas (nStr) {
//   nStr += ''
//   var x = nStr.split('.')
//   var x1 = x[0]
//   var x2 = x.length > 1 ? '.' + x[1] : ''
//   var rgx = /(\d+)(\d{3})/
//   while (rgx.test(x1)) {
//     x1 = x1.replace(rgx, '$1' + ',' + '$2')
//   }
//   return x1 + x2
// }

let n = 12456.3121
console.log(format(n))
