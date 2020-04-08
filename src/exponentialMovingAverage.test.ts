import ema from "./exponentialMovingAverage"
// import data from "./fixtures/http_200_historical_prices_resolution60_limit200.json"

describe("ema", () => {
  const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

  test("should throw an Error if the data set is not at least twice as large as the period", () => {
    // console.log(ema(data.result, 21))
    // console.log(ema(data, 11))
    expect(() => ema(data, 21)).toThrow(Error)
  })

  test("should", () => {
    // console.log(ema(data, 10))
    const results = ema(data, 10)
    expect(results.length).toEqual(10)
    expect(results[results.length - 1]).toEqual(10.18)
  })
})
