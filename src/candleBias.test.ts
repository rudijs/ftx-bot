import candleBias from "./candleBias"

describe("candleBias", () => {
  test("should throw an Error if the current observation time is not greater than the previous observation time", () => {
    const badData: any = {
      result: [
        { open: 1, close: 2, time: 1586061840000.0 },
        { open: 2, close: 3, time: 1586061780000.0 },
        { open: 3, close: 4, time: 1586061720000.0 },
      ],
    }
    expect(() => candleBias(badData.result, badData.result[2].time)).toThrowError(new Error("Current time is not greater than previous time"))
  })

  test("should return a Bullish BUY side with GREEN candle when current Close is higher than previous Open", () => {
    const data: any = {
      result: [
        { open: 2, close: 3, time: 1586061720000.0 },
        { open: 3, close: 4, time: 1586061780000.0 },
      ],
    }
    // console.log(candleBias(data.result))
    const res = candleBias(data.result, data.result[1].time + 60000)
    expect(res.side).toBe("buy")
    expect(res.candleColor).toBe("green")
  })

  test("should return a Bearish SELL side with RED candle when current Close is lower than previous Open", () => {
    const data: any = {
      result: [
        { open: 2, close: 3, time: 1586061720000.0 },
        { open: 3, close: 1, time: 1586061780000.0 },
      ],
    }
    const res = candleBias(data.result, data.result[1].time + 60000)
    expect(res.side).toBe("sell")
    expect(res.candleColor).toBe("red")
  })

  test("should return a Bullish Continuation NEUTRAL side with RED candle when current Close is equal to the previous Open", () => {
    const data: any = {
      result: [
        { open: 2, close: 3, time: 1586061720000.0 },
        { open: 3, close: 2, time: 1586061780000.0 },
      ],
    }
    const res = candleBias(data.result, data.result[1].time + 60000)
    expect(res.side).toBe("neutral")
    expect(res.candleColor).toBe("red")
  })

  test("should return a Bearish Continuation NEUTRAL side with GREEN candle when current Close is equal to the previous Open", () => {
    const data: any = {
      result: [
        { open: 4, close: 3, time: 1586061720000.0 },
        { open: 3, close: 4, time: 1586061780000.0 },
      ],
    }
    const res = candleBias(data.result, data.result[1].time + 60000)
    expect(res.side).toBe("neutral")
    expect(res.candleColor).toBe("green")
  })

  test("should return a Neutral Continuation NEUTRAL side with NEUTRAL candle when current Close is equal to the previous Open", () => {
    const data: any = {
      result: [
        { open: 2, close: 2, time: 1586061720000.0 },
        { open: 2, close: 2, time: 1586061780000.0 },
      ],
    }
    const res = candleBias(data.result, data.result[1].time + 60000)
    expect(res.side).toBe("neutral")
    expect(res.candleColor).toBe("neutral")
  })

  // when the algo runs at the begining of a new time period, for example every minute
  // we want to analyze data from the previous minute backward
  // as the current minute has just started and the OHLC values are subject to change (the minute has yet to complete)
  test("should analyze data from the minute previous to the current minute", () => {
    const data: any = {
      result: [
        { open: 2, close: 3, time: 1586061720000.0 },
        { open: 3, close: 4, time: 1586061780000.0 },
        { open: 4, close: 2, time: 1586061840000.0 },
      ],
    }
    // console.log(candleBias(data.result))
    const res = candleBias(data.result, data.result[2].time)
    expect(res.side).toBe("buy")
    expect(res.candleColor).toBe("green")
  })
})
