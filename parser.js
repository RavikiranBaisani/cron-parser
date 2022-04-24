const ARGS_COUNT = 6

const MINUTE = 'minute', HOUR = 'hour', MONTH = 'month', DAY_OF_WEEK = 'dow', DAY_OF_MONTH = 'dom';
const PADDING_LENGTH = 14;
const abbreviations = {
    dom: 'day of month',
    dow: 'day of week'
}

const INPUT_RANGES = {
    minute: [0, 59],
    hour: [0, 23],
    dom: [1, 31],
    month: [1, 12],
    dow: [1, 7]
}

const months = ['JAN', 'FEB', 'MAR',
    'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP',
    'OCT', 'NOV', 'DEC']

const days = [
    'SUN', 'MON', 'TUE',
    'WED', 'THU', 'FRI',
    'SAT'
]

const delimiters = {
    FrequencyDelimiter: "/",
    ListDelimiter: ",",
    RangeDelimiter: "-",
    FixedDelimiter: "",
    Wildcard: "*"
}

const allowedChars = ['/', '*', '-', ',']

function validateArgs(args = []) {
    if (args.length != ARGS_COUNT) {
        throw new Error('Invalid number of args passed!!!')
    }
}

function generateRange(start, end) {
    const range = []
    for (let i = start; i <= end; i++) {
        range.push(i);
    }
    return range;
}

function isRangeBound(start, end, type) {
    let startValue = start
    let endValue = end
    if (isNaN(start) && isNaN(end)) {
        const data = type == MONTH ? months : days
        startValue = data.indexOf(start.toUpperCase()) + 1
        endValue = data.indexOf(end.toUpperCase()) + 1
    }
    return startValue <= endValue && startValue >= INPUT_RANGES[type][0] && endValue <= INPUT_RANGES[type][1]
}

function processRange(input, type) {
    let [start, end] = input.split('-')
    if (!isRangeBound(start, end, type)) {
        throw new Error(`Invalid range in ${abbreviations[type] || type}`)
    }
    const values = []
    if (isNaN(start)) {
        const data = type == 'month' ? months : days
        const startIndex = data.indexOf(start.toUpperCase())
        const endIndex = data.indexOf(end.toUpperCase())
        for (let i = startIndex; i <= endIndex; i++) {
            values.push(i)
        }
    } else {
        start = parseInt(start)
        end = parseInt(end)
        values.push(...generateRange(start, end))
    }
    return values
}

function processFrequency(input, type) {
    let [frequency, step] = input.split('/')
    const values = []
    step = parseInt(step)

    if (frequency == '*') {
        const startIndex = INPUT_RANGES[type][0]
        const endIndex = INPUT_RANGES[type][1]
        for (let i = startIndex; i <= endIndex; i += step) {
            values.push(i)
        }
    } else if (frequency.indexOf('-') >= 0) {
        const rangeOfValues = processRange(frequency)
        for (let i = 0; i < rangeOfValues.length; i += step) {
            values.push(rangeOfValues[i])
        }
    }
    return values
}

function isAlphaNumeric(string) {
    return string.match('/^[a-zA-Z-]+$/')
}

function processRangeAndFrequency(input, type) {
    let [range, frequency] = input.split('/')
    const fullRange = []
    const values = []
    fullRange.push(...processRange(range, type))
    frequency = parseInt(frequency)
    for (let i = 0; i < fullRange.length; i += frequency) {
        values.push(fullRange[i])
    }
    return values
}

function processInput(input, type) {
    if (input === delimiters.Wildcard) {
        return generateRange(INPUT_RANGES[type][0], INPUT_RANGES[type][1])
    }
    if (input.indexOf(delimiters.RangeDelimiter) >= 0 && input.indexOf(delimiters.FrequencyDelimiter) >= 0) {
        return processRangeAndFrequency(input, type)
    }
    if (input.indexOf(delimiters.RangeDelimiter) >= 0) {
        return processRange(input, type)
    }
    if (input.indexOf(delimiters.FrequencyDelimiter) >= 0) {
        return processFrequency(input, type)
    }
    if (isNaN(input)) {
        if (type == MONTH)
            return [months.indexOf(input.toUpperCase()) + 1]
        if (type == DAY_OF_WEEK)
            return [days.indexOf(input.toUpperCase()) + 1]
    }
    return [parseInt(input)]
}

function processTerm(term, type) {
    const inputs = term.split(',')
    const values = []
    for (let input of inputs) {
        values.push(...processInput(input, type))
    }
    return values
}

function formatOutput(minute, hour, dom, month, dow, cmd) {
    const result = []
    result.push('minute'.padEnd(PADDING_LENGTH) + minute)
    result.push('hour'.padEnd(PADDING_LENGTH) + hour)
    result.push('day of month'.padEnd(PADDING_LENGTH) + dom)
    result.push('month'.padEnd(PADDING_LENGTH) + month)
    result.push('day of week'.padEnd(PADDING_LENGTH) + dow)
    result.push('command'.padEnd(PADDING_LENGTH) + cmd)
    return result.join('\n')
}

function parseExpression(args) {
    const parsedExpression = {}
    const [minute, hour, dom, month, dow, cmd] = args
    const minuteSchedule = processTerm(minute.trim(), MINUTE)
    const hourSchedule = processTerm(hour.trim(), HOUR)
    const domSchedule = processTerm(dom.trim(), DAY_OF_MONTH)
    const monthSchedule = processTerm(month.trim(), MONTH)
    const dowSchedule = processTerm(dow.trim(), DAY_OF_WEEK)
    parsedExpression.minuteSchedule = minuteSchedule
    parsedExpression.hourSchedule = hourSchedule
    parsedExpression.domSchedule = domSchedule
    parsedExpression.monthSchedule = monthSchedule
    parsedExpression.dowSchedule = dowSchedule
    parsedExpression.cmd = cmd
    return parsedExpression
}


(function main() {
    try {
        const cronExpression = process.argv[2]
        const args = cronExpression.split(" ")
        validateArgs(args)
        const { minuteSchedule, hourSchedule, domSchedule, monthSchedule, dowSchedule, cmd } = parseExpression(args)
        const formattedOutput = formatOutput(minuteSchedule, hourSchedule, domSchedule, monthSchedule, dowSchedule, cmd)
        console.log(formattedOutput)
    } catch (e) {
        console.error(e)
    }
})()