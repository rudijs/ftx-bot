import ema from "./exponentialMovingAverage"
import data from "./fixtures/http_200_historical_prices_resolution60_limit200.json"

describe("ema", () => {
  test("should", () => {
    console.log(ema(data.result, 21))
  })
})
