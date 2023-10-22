let data = [
  { dates: '4', date: 'four' },
  { dates: '3', date: 'three' },
  { dates: '3', date: 'three' },
  { dates: '3', date: 'three' },
  { dates: '3', date: 'three' },
  { dates: '2', date: 'two' }
]
const f1 = 'dates'
const f2 = 'date'

function theMap (obj, criteria, days, дата) {
  let crit = []
  let r = new Map()
  for (let d in obj) {
    r.set(obj[d][days], obj[d][дата])
  }
  for (let s in criteria) {
    crit.push(r.get(criteria[s]))
  }
  return crit
}

let criteria = []
for (let i in data) {
  criteria.push(data[i][f1])
}
console.log(theMap(data, criteria, f1, f2))
