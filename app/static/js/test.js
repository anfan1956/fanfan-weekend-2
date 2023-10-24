let data = [
  {
    адрес: 'г Москва, Ленинский пр-кт, д 52, кв 430',
    получатель: 'Федоров Александр Николаевич',
    'телефон получателя': '9167834248',
    код: '979645'
  }
]
console.log('информация о доставке')
let colNames = Object.keys(data[0])
let dataValues = Object.values(data[0])
// for (let c in colNames) {
//   console.log(colNames[c])
// }
for (let d in colNames) {
  console.log(colNames[d], ': ', dataValues[d])
}
