var inv = [
  {
    styleid: '19363',
    color: '72547',
    size: '42',
    qty: 1,
    price: 89420,
    discount: '0.3',
    promo: '0.25',
    total: 46945,
    pcs: 5
  },
  {
    styleid: '9574',
    color: 'ALUMINIUM',
    size: '2',
    qty: 3,
    price: 21675,
    discount: '0.0',
    promo: '0.0',
    total: 65025
  },
  {
    styleid: '19204',
    color: '670 BLUe',
    size: 'XXL',
    qty: 1,
    price: 94860,
    discount: '0.4',
    promo: '0.0',
    total: 56916
  }
]
const amount = inv
  .map(obj => obj.total)
  .reduce((sum, current) => sum + current, 0)

console.log(amount)
