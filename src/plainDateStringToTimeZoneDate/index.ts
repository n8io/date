import { millisecondsInAMinute } from '../constants'
import {
  TimeZoneOffsetFormatter,
  getTimeZoneUtcOffsetInMinutes,
  makeTimeZoneOffsetFormatter,
} from '../getTimeZoneUtcOffsetInMinutes'

const systemFormatter = makeTimeZoneOffsetFormatter(Intl.DateTimeFormat().resolvedOptions().timeZone)

const plainDateStringToTimeZoneDate = (
  plainDateString: string,
  timeZoneOffsetFormatter: TimeZoneOffsetFormatter
): Date => {
  const date = new Date(plainDateString)
  const systemTimeZoneOffsetMilliseconds = getTimeZoneUtcOffsetInMinutes(date, systemFormatter) * millisecondsInAMinute
  const requestedTimeZoneOffsetInMinutes = getTimeZoneUtcOffsetInMinutes(date, timeZoneOffsetFormatter)
  const requestedTimeZoneOffsetInMilliseconds = -1 * (requestedTimeZoneOffsetInMinutes * millisecondsInAMinute)
  const output = new Date(date.getTime() + requestedTimeZoneOffsetInMilliseconds + systemTimeZoneOffsetMilliseconds)

  return output
}

export { plainDateStringToTimeZoneDate }
