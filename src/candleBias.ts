type returnVal = { side: "buy" | "sell" | "neutral"; candleColor: "green" | "red" | "neutral" }
type input = { close: number; open: number; time: number }[]

export default (data: input, execTime: number): returnVal => {
  // data check - make sure the data end with the minute previous to this execTime minute
  // as this script runs at the start of a new minute we want discard this minute as it's subject to change
  if (new Date(data[data.length - 1].time).getMinutes() === new Date(execTime).getMinutes()) {
    data.pop()
  }

  const prev = data[data.length - 2]
  const curr = data[data.length - 1]

  // data check - make sure new previous data is before newer data
  if (curr.time < prev.time) {
    throw new Error("Current time is not greater than previous time")
  }

  const result: returnVal = {
    side: "neutral",
    candleColor: "neutral",
  }

  if (curr.close > curr.open) result.candleColor = "green"
  if (curr.close < curr.open) result.candleColor = "red"

  if (curr.close > prev.open) result.side = "buy"
  if (curr.close < prev.open) result.side = "sell"

  return result as returnVal
}
