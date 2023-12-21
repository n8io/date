const SYMBOL = Symbol('TimeZoneOffsetFormatter')

type TimeZoneOffsetFormatter = Intl.DateTimeFormat & {
  __type_check__: symbol
}

const defaultFormatterOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
}

const utcFormatter = new Intl.DateTimeFormat('en-US', {
  ...defaultFormatterOptions,
  timeZone: 'UTC',
})

const makeTimeZoneOffsetFormatter = (timeZone: string): TimeZoneOffsetFormatter => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZone,
  })

  // @ts-expect-error We ignore this because we are monkey patching to ensure that we're using the proper formatter with our expected options
  formatter.__type_check__ = SYMBOL

  // @ts-expect-error We ignore this because we are monkey patching to ensure that we're using the proper formatter with our expected options
  return formatter
}

const secondsInAMinute = 60
const millisecondsInAMinute = secondsInAMinute * 1_000

const invariantParameterCheck = (date: Date, formatter: TimeZoneOffsetFormatter) => {
  if (!date || !(date instanceof Date)) {
    throw new Error('DATE_REQUIRED: A date is required and must be a Date object')
  }

  if (!formatter) {
    throw new Error('FORMATTER_REQUIRED: A formatter is required')
  }

  if (formatter.__type_check__ !== SYMBOL) {
    throw new Error('INVALID_FORMATTER: The provided formatter must be created with "makeTimeZoneOffsetFormatter"')
  }
}

const getTimeZoneUtcOffsetInMinutes = (date: Date, formatter: TimeZoneOffsetFormatter) => {
  invariantParameterCheck(date, formatter)

  // Format the date in the specified time zone
  const tzDateStr = formatter.format(date)

  // Format the date in UTC
  const utcDateStr = utcFormatter.format(date)

  // Convert formatted dates back to Date objects
  const tzDate = new Date(tzDateStr)
  const utcDate = new Date(utcDateStr)

  // Calculate the offset in minutes
  return (tzDate.getTime() - utcDate.getTime()) / millisecondsInAMinute
}

export type { TimeZoneOffsetFormatter }
export { getTimeZoneUtcOffsetInMinutes, makeTimeZoneOffsetFormatter }
