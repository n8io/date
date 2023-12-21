# `@n8io/date`

📆 A zero dependency, date utility library that uses the native `Intl.DateTimeFormat` api to work with `Date` objects.

![check-code-coverage](https://img.shields.io/badge/code--coverage-100%25-brightgreen)
[![Issues](https://img.shields.io/github/issues/n8io/date)](https://github.com/n8io/date/issues)
[![License](https://img.shields.io/github/license/n8io/date)](https://github.com/n8io/date/blob/main/LICENSE)

## Install

```shell
pnpm install @n8io/date
```

## Compared to other libraries

- Zero dependencies, has a tiny footprint with no extra bloat from time zone data
- Works with all IANA time zones
- Accounts for daylight savings time for time zones that observe it
- Uses the native `Intl.DateTimeFormat` api for all calculations
- We only deal with native `Date` objects, no monkey patching data types

## Basic Usage

### `makeTimeZoneOffsetFormatter`

This function generates a specifically configured instance of a `Intl.DateTimeFormat` that is used to determine time zone relative dates.

Please note that creating an instance of the formatter *can be an expensive* operation and should be done sparingly. This is especially important to keep in mind for scenarios that need to be as fast as possible.

```ts
import { makeTimeZoneOffsetFormatter } from '@n8io/date'

const timeZone = 'America/New_York'
const formatter = makeTimeZoneOffsetFormatter(timeZone)

formatter.format(new Date('2023-01-01T05:00:00.000Z')) // 01/01/2023, 00:00:00
```

### `getTimeZoneUtcOffsetInMinutes`

This function returns the UTC offset in minutes for a given date and time zone. 

```ts
import { getTimeZoneUtcOffsetInMinutes } from '@n8io/date'

const timeZone: IanaTimeZone = 'America/New_York'
const formatter = makeTimeZoneOffsetFormatter(timeZone)
const januaryDate = new Date('2023-01-01T12:00:00.000Z')
const julyDate = new Date('2023-07-01T12:00:00.000Z')

// The offset in minutes in January for America/New_York is...
getTimeZoneUtcOffsetInMinutes(januaryDate, formatter)
// -300 because the date is during daylight savings time

// The offset in minutes in July for America/New_York is...
getTimeZoneUtcOffsetInMinutes(julyDate, formatter)
// -240 because the date is during standard time
```

### `plainDateStringToTimeZoneDate`

This function is handy when you need a specific date and time in a specific time zone.

*NOTE: The plain date string must be in `yyyy-mm-dd hh:mm:ss` format*

```ts
import { makeTimeZoneOffsetFormatter, plainDateStringToTimeZoneDate } from '@n8io/date'

const timeZone = 'America/New_York'
const formatter = makeTimeZoneOffsetFormatter(timeZone)

const date = plainDateStringToTimeZoneDate(
  '2023-01-01 20:00:00',
  formatter,
)

date.toLocalString('en', { timeZone }) // 1/1/2023, 8:00:00 PM in New York
date.toISOString() // '2023-01-02T01:00:00.000Z'
```

## Contributing

We welcome contributions from the community. If you'd like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and write tests if applicable.
4. Commit your changes and push them to your fork.
5. Open a pull request to the main repository.
