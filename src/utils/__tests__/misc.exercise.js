import {formatDate} from 'utils/misc'

describe('formatDate formats the date to look nice', () => {
  it.each([
    [new Date('January 19, 1980'), 'Jan 80'],
    [new Date('December 13, 1992'), 'Dec 92'],
  ])('produces the correct formatting', (date, expected) => {
    expect(formatDate(date)).toStrictEqual(expected)
  })
})
