// Initial MA: SMA
// EMA: {Close - EMA(previous_day)} x Multiplier + EMA(previous_day)
// Multiplier: (2/time_periods + 1)

export default (data: any, period: number = 21) => {
  console.log(data.length, period)
}
