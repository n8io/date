import { millisecondsInAMinute } from '../constants'
import {
  TimeZoneOffsetFormatter,
  getTimeZoneUtcOffsetInMinutes,
  makeTimeZoneOffsetFormatter,
} from '../getTimeZoneUtcOffsetInMinutes'

const systemFormatter = makeTimeZoneOffsetFormatter(Intl.DateTimeFormat().resolvedOptions().timeZone)
const formatRegex = /^\d{4}(?:-\d{2}(?:-\d{2}(?:(?:T|\s)\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?)?)?)?$/

const checkPlainDateString = (plainDateString: string): void => {
  if (!plainDateString) {
    throw new Error('Plain date string is required')
  }

  if (formatRegex.test(plainDateString) === false) {
    throw new Error(
      'Plain date string must not contain an offset or end in "Z". Valid formats include "YYYY-MM-DD" and "YYYY-MM-DD HH:mm:ss"'
    )
  }
}

const plainDateStringToTimeZoneDate = (
  plainDateString: string,
  timeZoneOffsetFormatter: TimeZoneOffsetFormatter
): Date => {
  checkPlainDateString(plainDateString)

  const date = new Date(plainDateString)
  const systemTimeZoneOffsetMilliseconds = getTimeZoneUtcOffsetInMinutes(date, systemFormatter) * millisecondsInAMinute
  const requestedTimeZoneOffsetInMinutes = getTimeZoneUtcOffsetInMinutes(date, timeZoneOffsetFormatter)
  const requestedTimeZoneOffsetInMilliseconds = -1 * (requestedTimeZoneOffsetInMinutes * millisecondsInAMinute)
  const output = new Date(date.getTime() + requestedTimeZoneOffsetInMilliseconds + systemTimeZoneOffsetMilliseconds)

  return output
}

export { plainDateStringToTimeZoneDate }
