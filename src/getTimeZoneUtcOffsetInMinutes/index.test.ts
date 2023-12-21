import { describe, expect, test } from 'vitest'
import { getTimeZoneUtcOffsetInMinutes, makeTimeZoneOffsetFormatter } from '.'

const hours = (num: number) => num * 60
const addDays = (date: Date, num: number) => new Date(date.getTime() + num * 24 * 60 * 60 * 1_000)
const addMilliseconds = (date: Date, num: number) => new Date(date.getTime() + num)

const timeZones = {
  HAWAII: 'Pacific/Honolulu', // Does not observe DST, behind UTC
  DENVER: 'America/Denver', // Observes DST, behind UTC
  LONDON: 'Europe/London', // Observes DST, at UTC
  GERMANY: 'Europe/Berlin', // Observes DST, ahead of UTC
  NEW_DELHI: 'Asia/Kolkata', // Does not observe DST, ahead of UTC, 30 minute offset
} as const

describe('getTimeZoneUtcOffsetInMinutes', () => {
  const std = new Date(2023, 0, 1) // This date is always in standard time (for time zones that observe DST)
  const dst = new Date(2023, 6, 1) // This date is always in daylight savings time (for time zones that observe DST)

  const cases = [
    {
      timeZone: timeZones.HAWAII,
      expected: {
        dst: hours(-10),
        std: hours(-10),
      },
    },
    {
      timeZone: timeZones.DENVER,
      expected: {
        dst: hours(-6),
        std: hours(-7),
      },
    },
    {
      timeZone: timeZones.LONDON,
      expected: {
        dst: hours(1),
        std: hours(0),
      },
    },
    {
      timeZone: timeZones.GERMANY,
      expected: {
        dst: hours(2),
        std: hours(1),
      },
    },
    {
      timeZone: timeZones.NEW_DELHI, // Does not observe DST
      expected: {
        dst: hours(5.5),
        std: hours(5.5),
      },
    },
  ] as const

  for (let index = 0; index < cases.length; index++) {
    const { expected, timeZone } = cases[index] as (typeof cases)[number]

    describe(`given the time zone is ${timeZone}`, () => {
      describe('and the date is during standard time', () => {
        test(`should return the expected offset of ${expected.std}`, () => {
          expect(getTimeZoneUtcOffsetInMinutes(std, makeTimeZoneOffsetFormatter(timeZone))).toEqual(expected.std)
        })
      })

      describe('and the date is during daylight savings time', () => {
        test(`should return the expected offset of ${expected.dst}`, () => {
          expect(getTimeZoneUtcOffsetInMinutes(dst, makeTimeZoneOffsetFormatter(timeZone))).toEqual(expected.dst)
        })
      })
    })
  }

  describe('when the date is near the daylight savings time change', () => {
    const timeZone = 'Australia/Melbourne'
    const timeChangeDate = new Date('2020-10-03T16:00:00.000Z') // '10/4/2020, 02:00:00 AM' in Melbourne (exact time of the DST change over)

    test('one day before', () => {
      const oneDayBefore = addDays(timeChangeDate, -1) // '10/3/2020, 02:00:00 AM' in Melbourne

      expect(getTimeZoneUtcOffsetInMinutes(oneDayBefore, makeTimeZoneOffsetFormatter(timeZone))).toEqual(hours(10))
    })

    test('1ms before time change', () => {
      const oneMsBeforeTimeChange = addMilliseconds(timeChangeDate, -1) // '10/4/2020, 01:59:59 AM' in Melbourne

      expect(getTimeZoneUtcOffsetInMinutes(oneMsBeforeTimeChange, makeTimeZoneOffsetFormatter(timeZone))).toEqual(
        hours(10)
      )
    })

    test('at exactly the time change', () => {
      expect(getTimeZoneUtcOffsetInMinutes(timeChangeDate, makeTimeZoneOffsetFormatter(timeZone))).toEqual(hours(11))
    })

    test('1ms after time change', () => {
      const oneMsAfterTimeChange = addMilliseconds(timeChangeDate, 1) // '10/4/2020, 03:00:01 AM' in Melbourne

      expect(getTimeZoneUtcOffsetInMinutes(oneMsAfterTimeChange, makeTimeZoneOffsetFormatter(timeZone))).toEqual(
        hours(11)
      )
    })

    test('one day after', () => {
      const oneDayBefore = addDays(timeChangeDate, 1) // '10/5/2020, 02:00:00 AM' in Melbourne

      expect(getTimeZoneUtcOffsetInMinutes(oneDayBefore, makeTimeZoneOffsetFormatter(timeZone))).toEqual(hours(11))
    })
  })

  describe('when a date is not provided', () => {
    test('should throw an error', () => {
      // @ts-expect-error We ignore this because we are testing the error case
      expect(() => getTimeZoneUtcOffsetInMinutes()).toThrow(
        'DATE_REQUIRED: A date is required and must be a Date object'
      )
    })
  })

  describe('when formatter is not provided', () => {
    test('should throw an error', () => {
      // @ts-expect-error We ignore this because we are testing the error case
      expect(() => getTimeZoneUtcOffsetInMinutes(new Date())).toThrow('FORMATTER_REQUIRED: A formatter is required')
    })
  })

  describe('when the formatter is not created by the makeTimeZoneOffsetFormatter', () => {
    test('should throw an error', () => {
      // @ts-expect-error We ignore this because we are testing the error case
      expect(() => getTimeZoneUtcOffsetInMinutes(new Date(), new Intl.DateTimeFormat())).toThrow(
        'INVALID_FORMATTER: The provided formatter must be created with "makeTimeZoneOffsetFormatter"'
      )
    })
  })
})
