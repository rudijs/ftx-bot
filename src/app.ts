import axios from "axios"
import fetchData from "./fetchData"
import simpleMovingAverage from "./simpleMovingAverage"

if (!process.env.FTX_API_KEY || !process.env.FTX_SECRET) throw new Error("Missing required FTX env vars")

const apiKey = process.env.FTX_API_KEY
const apiSecret = process.env.FTX_SECRET

// fetchData({ axios, apiKey, apiSecret, resolution: 60, limit: 200 })
// .then((res) => console.log(res.result))
// .catch((err) => console.log(err))

async function main(): Promise<any> {
  try {
    const data = await fetchData({ axios, apiKey, apiSecret, resolution: 60, limit: 200 })
    // console.log(data)

    const { startTime, sma, position } = simpleMovingAverage(data.result, 34)
    // console.log(sma, position)

    return `${startTime}: ${sma} - ${position}`
  } catch (e) {
    console.log(e)
  }
}

main()
  .then((res) => console.log(res))
  .catch((err) => console.log(err))
