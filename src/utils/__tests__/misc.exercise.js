import {formatDate} from 'utils/misc'

describe('formatDate formats the date to look nice', () => {
  it.each([
    [0, 'Dec 69'],
    ['', 'Dec 69'],
    [1610944527117, 'Jan 21'],
  ])('produces the correct formatting', (date, expected) => {
    expect(formatDate(date)).toStrictEqual(expected)
  })
})
