import { DataPoints, DataPoint } from "./fixtures/historical_prices_resolution60_limit34"

export default (data: DataPoints) => {
  // console.log(data)
  const sma34 = data.result.map((item: DataPoint) => item.close).reduce((prev, curr) => prev + curr, 0) / 34

  const sma13 =
    data.result
      .slice(-13)
      .map((item: DataPoint) => item.close)
      .reduce((prev, curr) => prev + curr, 0) / 13

  return { sma13, sma34 }
}
