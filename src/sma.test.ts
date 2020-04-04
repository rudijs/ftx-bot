import sma from "./sma"
import data from "./fixtures/historical_prices_resolution60_limit34"

describe("sma", () => {
  it("should sma", () => {
    console.log(sma(data))
    const smas = sma(data)
    expect(smas.sma13).toEqual(6710.076923076923)
    expect(smas.sma34).toEqual(6705.382352941177)
  })
})
