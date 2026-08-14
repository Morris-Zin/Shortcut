import type { AppState } from './appState'

export const sampleState: AppState = {
  shops: [
    { id: 'sample-market', name: 'Abc Market' },
    { id: 'sample-grocer', name: 'Def Grocer' },
    { id: 'sample-mart', name: 'Ghi Mart' },
  ],
  items: [
    {
      id: 'sample-rice',
      name: 'Rice 5 kg',
      quantity: '1',
      prices: {
        'sample-market': '28.90',
        'sample-grocer': '31.50',
        'sample-mart': '29.80',
      },
    },
    {
      id: 'sample-milk',
      name: 'Fresh milk',
      quantity: '2',
      prices: {
        'sample-market': '7.20',
        'sample-grocer': '6.40',
        'sample-mart': '6.80',
      },
    },
    {
      id: 'sample-eggs',
      name: 'Eggs, 10 pack',
      quantity: '1',
      prices: {
        'sample-market': '6.90',
        'sample-grocer': '',
        'sample-mart': '7.40',
      },
    },
  ],
  extraStopCost: '3.00',
}
