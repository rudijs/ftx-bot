export default (data: any[], period: number = 21) => {
  let position = "BULL"

  // console.log(data)
  // get data from the end of the dataset backward (positive to negative number)
  const dataSet = data.slice(-Math.abs(period))

  // calculate simple moving average for the period
  const sma = dataSet.map((item: any) => item.close).reduce((prev: number, curr: number) => prev + curr, 0) / period

  // Bull or Bear?
  // if the last price is above the SMA = Bull
  // if the last price is below the SMA = Bear
  const lastDataPoint = data.slice(-1)[0]
  // console.log(101, lastDataPoint)

  const { startTime, close } = lastDataPoint

  if (close < sma) {
    position = "BEAR"
  }

  return { startTime, sma, position }
}
