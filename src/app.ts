import axios from "axios"
import { ftxApi, ftxParams } from "./ftxApi"
import simpleMovingAverage from "./simpleMovingAverage"
import { hasToken } from "./wallet"

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
    console.log(`==> Start Time: ${startTime}`)
    console.log(`==> Current SMA: ${sma}`)
    console.log(`==> Current direction: ${position}`)

    // GET /wallet/balances
    path = "/api/wallet/balances"
    params.path = path

    const balances = await ftxApi(params)
    // console.log(balances)

    // Do we have a position in the current direction
    const openPosition = hasToken(balances.result, position)
    console.log(`==> Is current position matching current direction: ${openPosition}`)
    console.log(balances.result)
    if (openPosition) {
      console.log(`==> Current open position is good.`)
      console.log(`==> Done.`)
      return
    }

    // Cancel any Positions in the opposite direction
    console.log(`==> Closing open positions...`)

    // open new position in the current direction
    console.log(`==> Opening new position...`)

    return "Done"
  } catch (e) {
    console.log(e)
  }
}

main()
  .then((res) => console.log(res))
  .catch((err) => console.log(err))
