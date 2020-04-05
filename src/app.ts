import axios, { Method } from "axios"
import { ftxApi, ftxParams } from "./ftxApi"
import simpleMovingAverage from "./simpleMovingAverage"
import { hasToken, tokenBalance } from "./wallet"
import Decimal from "decimal.js"

if (!process.env.FTX_API_KEY || !process.env.FTX_SECRET) throw new Error("Missing required FTX env vars")

const apiKey = process.env.FTX_API_KEY
const apiSecret = process.env.FTX_SECRET

async function main(): Promise<any> {
  try {
    // get price data
    let method = "GET" as Method
    const coin = "BTC"
    const market = `${coin}-PERP`

    const tokens: any = {
      BULL: { token: "BULL", inverse: "BEAR" },
      BEAR: { token: "BEAR", inverse: "BULL" },
    }

    const resolution = 60
    const limit = 200
    let path = `/api/markets/${market}/candles?resolution=${resolution}&limit=${limit}`

    let params: ftxParams = { axios, apiKey, apiSecret, method, path }

    const data = await ftxApi(params)
    // console.log(data)

    // calculate and determine position status
    const { startTime, sma, position } = simpleMovingAverage(data.result, 34)
    console.log(`==> Coin: ${coin}`)
    console.log(`==> Market: ${market}`)
    console.log(`==> Start Time: ${startTime}`)
    console.log(`==> Current SMA: ${sma}`)
    console.log(`==> Current direction: ${position}`)

    // GET /wallet/balances
    path = "/api/wallet/balances"
    params.path = path

    const balances = await ftxApi(params)
    // console.log(balances)

    // Do we have a position in the current direction
    // const openPosition = hasToken(balances.result, Coins[position as any])
    const openPosition = hasToken(balances.result, tokens[position].token)
    console.log(`==> Is current position matching current direction: ${openPosition}`)
    console.log(balances.result)
    if (openPosition) {
      console.log(`==> Current open position is good.`)
      console.log(`==> Done.`)
      return
    }

    // Cancel any Positions in the opposite direction
    console.log(`==> Closing any open positions...`)
    console.log(`==> Inverse token: ${tokens[position].inverse}`)
    const inverseTokenBalance = tokenBalance(balances.result, tokens[position].inverse)
    console.log("==> Account balance:")
    console.log(inverseTokenBalance)
    if (inverseTokenBalance.total > 0) {
      params.method = "POST"
      params.path = "/api/orders"
      params.order = {
        market: `${tokens[position].inverse}/USD`,
        type: "market",
        side: "sell",
        price: null,
        size: inverseTokenBalance.total,
      }
    }
    // console.log(params)
    const res = await ftxApi(params)
    console.log(res)

    // open new position in the current direction
    console.log(`==> Opening new position...`)

    // return "TEMP DONE"

    // get available USD balance
    const accountBalance = tokenBalance(balances.result, "USD")
    console.log("==> Account balance:")
    console.log(accountBalance)

    // get market rates for token
    params.method = "GET"
    params.path = `/api/markets/${tokens[position].token}/USD`
    const marketRates = await ftxApi(params)
    console.log(`==> Market rates for ${tokens[position].token}`)
    console.log(marketRates)

    // calcuate size for market buy
    Decimal.set({ precision: 4, defaults: true })
    const usdValue = new Decimal(accountBalance.free).mul(0.9)
    console.log("==> USD Value:", usdValue.toNumber())
    const size = usdValue.div(marketRates.result.bid)
    console.log("==> Size:", size.toNumber())

    // Add new position
    params.method = "POST"
    params.path = "/api/orders"
    params.order = {
      market: `${tokens[position].token}/USD`,
      type: "market",
      side: "buy",
      price: null,
      size: size.toNumber(),
    }
    // console.log(params)
    const buyRes = await ftxApi(params)
    console.log(buyRes)

    return "Done"
  } catch (e) {
    console.log(e)
  }
}

main()
  .then((res) => console.log(res))
  .catch((err) => console.log(err))
