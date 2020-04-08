import Decimal from "decimal.js"
Decimal.set({ precision: 4, defaults: true })

// Initial MA: SMA
// EMA: {Close - EMA(previous_day)} x Multiplier + EMA(previous_day)
// Multiplier: (2/time_periods + 1)

type DecimalConfig = {
  precision: number
}

export default (data: number[], period: number = 21, config?: DecimalConfig) => {
  // data needs to be twice as long as the moving average period
  if (data.length < period * 2) throw Error(`Observation periods ${data.length} is not enough for period ${period}`)

  if (config && config.precision) {
    Decimal.set({ precision: config.precision })
  }
  const multiplier = new Decimal(2).div(new Decimal(period + 1))

  const initialSimpleMovingAverage: number = data
    .slice(-Math.abs(period * 2), -period)
    .reduce((prev: any, curr: any) => prev.plus(curr), new Decimal(0))
    .div(period)

  const emaDataSet = data.slice(-Math.abs(period))

  const results: number[] = []

  // // The first EMA calculation starts with the previous day SMA
  const intialEmaObservation = emaDataSet.shift() || 0
  const ema1 = new Decimal(intialEmaObservation - initialSimpleMovingAverage).mul(multiplier).plus(initialSimpleMovingAverage)
  results.push(ema1.toNumber())

  let i = 0
  while (emaDataSet[i]) {
    const previousDayEma = results.length - 1
    const emaObservation = new Decimal(emaDataSet[i] - previousDayEma).mul(multiplier).plus(previousDayEma)
    results.push(emaObservation.toNumber())
    i++
  }

  return results
}
