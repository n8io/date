import { describe, expect, test } from 'vitest'
import { plainDateStringToTimeZoneDate } from '.'
import { makeTimeZoneOffsetFormatter } from '../getTimeZoneUtcOffsetInMinutes'

describe('plainDateStringToTimeZoneDate', () => {
  const timeZones = {
    HAWAII: 'Pacific/Honolulu', // Does not observe DST, behind UTC
    DENVER: 'America/Denver', // Observes DST, behind UTC
    LONDON: 'Europe/London', // Observes DST, at UTC
    GERMANY: 'Europe/Berlin', // Observes DST, ahead of UTC
    NEW_DELHI: 'Asia/Kolkata', // Does not observe DST, ahead of UTC, 30 minute offset
  } as const

  describe('when a date is NOT during daylight savings time', () => {
    const dateString = '2023-01-01 20:00:00'

    const cases = [
      {
        string: dateString,
        timeZone: timeZones.HAWAII,
        expected: new Date('2023-01-02T06:00:00.000Z'),
      },
      {
        string: dateString,
        timeZone: timeZones.DENVER,
        expected: new Date('2023-01-02T03:00:00.000Z'),
      },
      {
        string: dateString,
        timeZone: timeZones.LONDON,
        expected: new Date('2023-01-01T20:00:00.000Z'),
      },
      {
        string: dateString,
        timeZone: timeZones.GERMANY,
        expected: new Date('2023-01-01T19:00:00.000Z'),
      },
      {
        string: dateString,
        timeZone: timeZones.NEW_DELHI,
        expected: new Date('2023-01-01T14:30:00.000Z'),
      },
    ] as const

    for (let index = 0; index < cases.length; index++) {
      const { string, timeZone, expected } = cases[index] as (typeof cases)[number]

      describe(`given the time zone is ${timeZone}`, () => {
        test('should return the expected date', () => {
          const formatter = makeTimeZoneOffsetFormatter(timeZone)

          expect(plainDateStringToTimeZoneDate(string, formatter)).toEqual(expected)
        })
      })
    }
  })

  describe('when a date is during daylight savings time', () => {
    const dateString = '2023-07-01 20:00:00'

    const cases = [
      {
        string: dateString,
        timeZone: timeZones.HAWAII,
        expected: new Date('2023-07-02T06:00:00.000Z'), // Does not observe DST
      },
      {
        string: dateString,
        timeZone: timeZones.DENVER,
        expected: new Date('2023-07-02T02:00:00.000Z'),
      },
      {
        string: dateString,
        timeZone: timeZones.LONDON,
        expected: new Date('2023-07-01T19:00:00.000Z'),
      },
      {
        string: dateString,
        timeZone: timeZones.GERMANY,
        expected: new Date('2023-07-01T18:00:00.000Z'),
      },
      {
        string: dateString,
        timeZone: timeZones.NEW_DELHI,
        expected: new Date('2023-07-01T14:30:00.000Z'), // Does not observe DST
      },
    ] as const

    for (let index = 0; index < cases.length; index++) {
      const { string, timeZone, expected } = cases[index] as (typeof cases)[number]

      describe(`given the time zone is ${timeZone}`, () => {
        test('should return the expected date', () => {
          const formatter = makeTimeZoneOffsetFormatter(timeZone)

          expect(plainDateStringToTimeZoneDate(string, formatter)).toEqual(expected)
        })
      })
    }
  })

  describe('when a date is during daylight savings time', () => {
    const dateString = '2021-07-01 05:00:00'

    const cases = [
      {
        string: dateString,
        timeZone: timeZones.DENVER,
        expected: new Date('2021-07-01T11:00:00.000Z'),
      },
    ] as const

    for (let index = 0; index < cases.length; index++) {
      const { string, timeZone, expected } = cases[index] as (typeof cases)[number]

      describe(`given the time zone is ${timeZone}`, () => {
        test('should return the expected date', () => {
          const formatter = makeTimeZoneOffsetFormatter(timeZone)

          expect(plainDateStringToTimeZoneDate(string, formatter)).toEqual(expected)
        })
      })
    }
  })

  describe('when the plain date string is empty', () => {
    test('should throw an error', () => {
      const formatter = makeTimeZoneOffsetFormatter(timeZones.DENVER)

      expect(() => plainDateStringToTimeZoneDate('', formatter)).toThrowError('Plain date string is required')
    })
  })

  describe('when the plain date string format is valid', () => {
    const formatter = makeTimeZoneOffsetFormatter(timeZones.DENVER)

    const cases = [
      { input: '2023-03-23T00:19', desc: 'with a T' },
      { input: '2023-03-23 21:19', desc: 'with a space' },
      { input: '2023-02-23', desc: 'without a time' },
      { input: '2023-02', desc: 'without a day' },
      { input: '2023', desc: 'without a month' },
      { input: '2023-05-23T09:19:34.324', desc: 'with milliseconds and a T' },
      { input: '2023-12-23 13:19:34.324', desc: 'with milliseconds and a space' },
    ]

    test.each(cases)('should not throw an error for $input', ({ input, desc }) => {
      expect(() => plainDateStringToTimeZoneDate(input, formatter)).not.toThrowError()
    })
  })

  describe('when the plain date string format is NOT valid', () => {
    const formatter = makeTimeZoneOffsetFormatter(timeZones.DENVER)

    const cases = [
      { input: '2023-03-23T00:19Z', desc: 'with a Z' },
      { input: '2023-03-23 21:19 GMT', desc: 'with a time zone' },
      { input: '2023-03-23T21:19+01:30', desc: 'with a time zone offset' },
      { input: 'ABC', desc: 'Completely wrong' },
      { input: null, desc: 'null' },
      { input: undefined, desc: 'given undefined' },
      { input: 12_345, desc: 'with a number' },
    ]

    test.each(cases)('should throw an error $desc $input', ({ input }) => {
      expect(() => plainDateStringToTimeZoneDate(input as string, formatter)).toThrowError()
    })
  })
})
