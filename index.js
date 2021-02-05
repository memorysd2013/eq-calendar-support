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
      temp = {
        day,
        today: isToday(fullDate),
        dateInfo: {
          ms: dayjs(fullDate).valueOf(),
          fullDate, year, month, day,
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

module.exports = {
  getFirstDay,
  getTotalDays,
  getWeeksOfMonth,
  getWeekday,
  getWholeWeekday,
  isToday,
  isTheSameMonth,
  getEmptyTemplate
}