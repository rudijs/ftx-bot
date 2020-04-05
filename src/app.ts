import axios from "axios"
import { ftxApi, ftxParams } from "./ftxApi"
import simpleMovingAverage from "./simpleMovingAverage"

if (!process.env.FTX_API_KEY || !process.env.FTX_SECRET) throw new Error("Missing required FTX env vars")

const apiKey = process.env.FTX_API_KEY
const apiSecret = process.env.FTX_SECRET

async function main(): Promise<any> {
  try {
    // get price data
    const method = "GET"
    const market = "BTC-PERP"
    const resolution = 60
    const limit = 200
    let path = `/api/markets/${market}/candles?resolution=${resolution}&limit=${limit}`

    let params: ftxParams = { axios, apiKey, apiSecret, method, path }

    const data = await ftxApi(params)
    // console.log(data)

    // calculate and determine position status
    const { startTime, sma, position } = simpleMovingAverage(data.result, 34)
    console.log(startTime, sma, position)
    // return `${startTime}: ${sma} - ${position}`

    // Get Positions
    // GET /wallet/balances
    path = "/api/wallet/balances"
    params.path = path

    const balances = await ftxApi(params)
    console.log(balances)

    // have a position in the current direction
    // exit

    // Cancel any Positions in the opposite direction

    // open new position in the current direction

    return "Done"
  } catch (e) {
    console.log(e)
  }
}

main()
  .then((res) => console.log(res))
  .catch((err) => console.log(err))
