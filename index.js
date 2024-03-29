let dayjs = require('dayjs')
  , dayJsExtension = {
    isToday: require('dayjs/plugin/isToday'),
    weekday: require('dayjs/plugin/weekday')
  }

dayjs.extend(dayJsExtension.isToday)
dayjs.extend(dayJsExtension.weekday)

/**
 * input: 年, 月
 * @return: 該月的1號是星期幾
 */
function getFirstDay(year, month) {
  try {
    let firstDay = dayjs(`${year}-${month}-1`).format('d')
    return Number(firstDay)
  } catch (e) {
    console.error('dayjsSupport: getFirstDay error')
    console.error(`@params: year: ${year}, month: ${month}`)
  }
}

/**
 * input: 年, 月
 * @return: 該月總共有幾天
 */
function getTotalDays(year, month) {
  try {
    let totalDays = dayjs(`${year}-${month}-1`).endOf('month').format('DD')
    return Number(totalDays)
  } catch (e) {
    console.error('dayjsSupport: getTotalDays error')
    console.error(`@params: year: ${year}, month: ${month}`)
  }
}

/**
 * input: 年, 月
 * @return: 該月總共佔據幾個星期
 */
function getWeeksOfMonth(year, month) {
  try {
    let firstDay = getFirstDay(year, month)
      , totalDays = getTotalDays(year, month)
    return Math.ceil((firstDay + totalDays) / 7)
  } catch (e) {
    console.error('dayjsSupport: getWeeksOfMonth error')
    console.error(`@params: year: ${year}, month: ${month}`)
  }
}

/**
 * input: timestamp
 * @return: 該日位於當月的第幾週 (以日為第一天算起)
 */
function getWeekIndexOfMonth(timestamp) {
  const map = {
    end: d => {
      if (d <= 7) return 1
      else if (d >= 8 && d <= 14) return 2
      else return 0
    },
    start: d => {
      if (d >= 2 && d <= 8) return 2
      else if (d >= 9 && d <= 15) return 3
      else if (d >= 16 && d <= 22) return 4
      else if (d >= 23 && d <= 29) return 5
      else if (d >= 30) return 6
      else return 0
    }
  }
  try {
    let date = Number(dayjs(timestamp).format('DD'))

    return date <= 7
      ? map.end(Number(dayjs(timestamp).endOf('week').format('DD')))
      : map.start(Number(dayjs(timestamp).startOf('week').format('DD')))
  } catch (e) {
    console.error('dayjsSupport: getWeekIndexOfMonth error')
    console.error(`@params: timestamp: ${timestamp}`)
    console.error(e)
  }
}

/**
 * 取得特定日期的 weekday
 * return 0 - 6 = Sunday:0, Monday:1
 */
function getWeekday(date) {
  try {
    return dayjs(date).format('d')
  }
  catch (e) {
    console.error('dayjsSupport: getWeekday error')
    console.error(`@params: date: ${date}`)
  }
}

/**
 * 傳入日期與起始日, 回傳該日期一整週的資訊
 * input:
 * - date: YYYY/M/D
 * - startDay: 一週的開始日, Sunday:0, Monday:1
 */
function getWholeWeekday(date, startDay) {
  try {
    let arr = []
    for (let i = startDay;i < startDay + 7;i++) {
      let _date = dayjs(date).weekday(i)
        , ms = _date.valueOf()
        , [year, month, day] = _date.format('YYYY/MM/DD').split("/")
      arr.push({
        // 讓 weekday 永遠維持在 0 - 6
        weekday: (i + 7) % 7,
        ms, year, month, day,
        fullDate: `${year}/${month}/${day}`,
      })
    }
    return arr
  }
  catch (e) {
    console.error('dayjsSupport: getWholeWeekday error', e)
    console.error(`@params: date: ${date}, startDay: ${startDay}`)
  }
}

/**
 * 用 dayjs 的 extend function 檢查是否為今天
 */
function isToday(date) {
  return dayjs(date).isToday()
}

/**
 * 透過 dayjs 的 format 轉換成 'YYYY/MM' 去比對兩個年月是否一致
 */
function isTheSameMonth({ current, target }) {
  return dayjs(current).format('YYYY/MM') === dayjs(target).format('YYYY/MM')
}

function getEmptyTemplate(type, date = {}, options) {
  switch (type) {
    case 'Year':
      return _getYearEmptyTemplate(date)
    case 'Month':
      return _getMonthEmptyTemplate(date)
    case 'Week':
      return _getWeekEmptyTemplate(date, options)
    case 'Day':
      return _getDayEmptyTemplate(date, options)
  }
}

function _getYearEmptyTemplate() {
  return []
}

function _getMonthEmptyTemplate(date = {}) {
  let year = date.year
    , month = date.month
    , firstWeekday = getFirstDay(year, month)
    , totalDays = getTotalDays(year, month)
    , weeksOfMonth = getWeeksOfMonth(year, month)
    , arr = []
    , temp = {}

  // 計算總共佔據星期數 * 7 天
  for (let i = 0;i < (weeksOfMonth * 7);i++) {
    temp = { day: '', dateInfo: {}, content: [] }
    if (i >= firstWeekday && i < (totalDays + firstWeekday)) {
      let day = i - firstWeekday + 1
        , fullDate = `${year}/${month}/${day}`
        , ms = dayjs(fullDate).valueOf()
      temp = {
        day,
        dayStyle: {
          cursor: 'pointer'
        },
        dayCustomClass: '',
        today: isToday(fullDate),
        dateInfo: {
          ms, fullDate, year, month, day, 
          week: getWeekIndexOfMonth(ms),
          weekday: getWeekday(fullDate)
        },
        content: []
      }
    }

    arr.push(temp)
  }
  return arr
}

function _getWeekEmptyTemplate(date = {}, options = {}) {
  let { year, month, day } = date
    , { weekStartAt } = options

  return getWholeWeekday(`${year}-${month}-${day}`, weekStartAt || 0)
}

function _getDayEmptyTemplate(time = { startHour: 0, endHour: 23 }, options = {}) {
  let { startHour, endHour } = time
    , clockFormat = c => c < 10 ? `0${c}` : c
    , range = Math.abs(endHour - startHour)
    , arr = []

  for (let i = startHour;i <= endHour;i++) {
    let hourTemp = {
      clock: `${clockFormat(i)}:00`,
      hourContent: []
    }
    arr.push(hourTemp)
  }

  return arr
}

module.exports = {
  getFirstDay,
  getTotalDays,
  getWeeksOfMonth,
  getWeekday,
  getWeekIndexOfMonth,
  getWholeWeekday,
  isToday,
  isTheSameMonth,
  getEmptyTemplate
}