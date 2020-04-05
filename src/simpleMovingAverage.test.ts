import simpleMovingAverage from "./simpleMovingAverage"
import data from "./fixtures/http_200_historical_prices_resolution60_limit200.json"

describe("sma", () => {
  it("should calculate the 21 period simple moving average by default", () => {
    // console.log(data)
    // console.log(sma(data.result))
    const { sma, position } = simpleMovingAverage(data.result)
    expect(sma).toEqual(6778.190476190476)
    // console.log(position)
    expect(position).toEqual("BULL")
  })

  it("should calculate the 13 period simple moving average", () => {
    const { sma, position } = simpleMovingAverage(data.result, 13)
    expect(sma).toEqual(6782.884615384615)
    // console.log(position)
    expect(position).toEqual("BULL")
  })

  it("should calculate the 34 period simple moving average", () => {
    const { sma, position } = simpleMovingAverage(data.result, 34)
    expect(sma).toEqual(6780.323529411765)
    // console.log(position)
    expect(position).toEqual("BULL")
  })
})
