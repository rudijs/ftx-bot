import axios, { Method } from "axios"
import { ftxApi, ftxParams } from "./ftxApi"
import { tokenBalance } from "./wallet"
import Decimal from "decimal.js"
import { EMA, RSI } from "technicalindicators"

if (!process.env.FTX_API_KEY || !process.env.FTX_SECRET) throw new Error("Missing required FTX env vars")

const apiKey = process.env.FTX_API_KEY
const apiSecret = process.env.FTX_SECRET

async function main(): Promise<any> {
  try {
    const args = process.argv.slice()
    let coin = "BTC"
    let resolution = 60
    let subAccount = "ALGO-PERP"
    let params: ftxParams

    // Optional command line parameters
    if (args[2]) coin = args[2]
    if (args[3]) resolution = +args[3]
    if (args[4]) subAccount = args[4]

    const market = `${coin}-PERP`

    console.log("==> ===============================================================================")
    console.log(`==> Local Time: ${new Date(Date.now())}`)
    console.log(`==> Coin: ${coin}`)
    console.log(`==> Market: ${market}`)

    // GET /wallet/balances
    let method = "GET" as Method
    let path = "/api/wallet/balances"
    params = { axios, apiKey, apiSecret, subAccount, method, path }

    let balances = await ftxApi(params)
    console.log("==> Wallet Balances:")
    console.log(balances.result)

    // GET historical data
    const limit = 200
    console.log(`==> Historical data resolution: ${resolution}`)
    console.log(`==> Historical data limit: ${limit}`)
    path = `/api/markets/${market}/candles?resolution=${resolution}&limit=${limit}`

    params = { axios, apiKey, apiSecret, subAccount, method, path }

    const data = await ftxApi(params)
    console.log("==> GET historical data", data.success)

    // determine directional bias - bull or bear
    const closePrices = data.result.map((item: any) => item.close)
    // console.log(closePrices)

    const rsiValues = RSI.calculate({ period: 14, values: closePrices })
    // console.log(rsiValues.slice(-5))
    const rsi = rsiValues[rsiValues.length - 1].toFixed(2)
    console.log(`==> Current RSI: ${rsi}`)

    const rsiEmaValues = EMA.calculate({ period: 55, values: rsiValues })
    const rsiEma = rsiEmaValues[rsiEmaValues.length - 1].toFixed(2)
    console.log(`==> Current RSI EMA: ${rsiEma}`)

    const lastPrice = closePrices.pop()
    console.log(`==> Current Price: ${lastPrice}`)

    let directionalBias = "BULL"
    // if (currentEma5 < currentEma13) {
    if (rsi < rsiEma) {
      directionalBias = "BEAR"
    }
    if (rsi === rsiEma) {
      return "==> RSI and RSI EMA are equal - position is NEUTRAL, no action taken"
    }

    console.log(`==> Current direction bias: ${directionalBias}`)

    console.log(`==> Getting trade positions (for now there is only ever one position)...`)
    params.method = "GET"
    params.path = "/api/positions"
    let positions = await ftxApi(params)
    console.log("==> Positions:")
    // console.log(positions.result)
    const bullPositions = positions.result.filter((item: any) => item.side === "buy" && item.size > 0)
    console.log(`==> Bull positions:`)
    console.log(bullPositions)

    const bearPositions = positions.result.filter((item: any) => item.side === "sell" && item.size > 0)
    console.log(`==> Bear positions:`)
    console.log(bearPositions)

    if (directionalBias === "BULL") {
      // close any shorts
      if (bearPositions.length) {
        params.method = "POST"
        params.path = "/api/orders"
        params.order = {
          market,
          type: "market",
          side: "buy",
          price: null,
          size: bearPositions[0].size,
          reduceOnly: true,
        }
        // console.log(params)
        const res = await ftxApi(params)
        console.log(res)

        // wait for a few moments for the exchange to process
        await new Promise((resolve) => {
          const delay = 2000
          console.log(`==> Wait: Allow ${delay}ms for exchange to complete the market sell order and update wallet USD balance...`)
          setTimeout(() => resolve(), delay)
        })
      }
      // check if any longs
      if (bullPositions.length) {
        console.log(`==> Bull positions in market ${market} are OK.`)
        return "==> Done."
      } else {
        console.log(`==> Opening new Bull position in market ${market}...`)

        // update balances
        params.method = "GET"
        params.path = "/api/wallet/balances"
        params.order = undefined
        balances = await ftxApi(params)
        console.log(balances)

        // get available USD balance
        const accountUsdBalance = tokenBalance(balances.result, "USD")
        console.log("==> Account USD balance:")
        console.log(accountUsdBalance)

        // get market rates for token
        params.method = "GET"
        params.path = `/api/markets/${market}`
        const marketRates = await ftxApi(params)
        console.log(`==> Market rates for ${market}`)
        console.log(marketRates)

        // calcuate size for market buy
        Decimal.set({ precision: 4, defaults: true })
        const usdValue = new Decimal(accountUsdBalance.free).mul(0.9)
        console.log("==> USD Value:", usdValue.toNumber())
        const size = usdValue.div(marketRates.result.bid)
        console.log("==> Size:", size.toNumber())

        // Add new position
        params.method = "POST"
        params.path = "/api/orders"
        params.order = {
          market: `${market}`,
          type: "market",
          side: "buy",
          price: null,
          size: size.toNumber(),
        }
        // console.log(params)
        const buyRes = await ftxApi(params)
        console.log(buyRes)
      }
    }

    if (directionalBias === "BEAR") {
      // close any long
      if (bullPositions.length) {
        params.method = "POST"
        params.path = "/api/orders"
        params.order = {
          market,
          type: "market",
          side: "sell",
          price: null,
          size: bullPositions[0].size,
          reduceOnly: true,
        }
        // console.log(params)
        const res = await ftxApi(params)
        console.log(res)

        // wait for a few moments for the exchange to process
        await new Promise((resolve) => {
          const delay = 2000
          console.log(`==> Wait: Allow ${delay}ms for exchange to complete the market sell order and update wallet USD balance...`)
          setTimeout(() => resolve(), delay)
        })
      }

      // check if any shorts
      if (bearPositions.length) {
        console.log(`==> Bear positions in market ${market} are OK.`)
        return "==> Done."
      } else {
        console.log(`==> Opening new Bear position in market ${market}...`)

        // update balances
        params.method = "GET"
        params.path = "/api/wallet/balances"
        params.order = undefined
        balances = await ftxApi(params)
        console.log(balances)

        // get available USD balance
        const accountUsdBalance = tokenBalance(balances.result, "USD")
        console.log("==> Account USD balance:")
        console.log(accountUsdBalance)

        // get market rates for token
        params.method = "GET"
        params.path = `/api/markets/${market}`
        const marketRates = await ftxApi(params)
        console.log(`==> Market rates for ${market}`)
        console.log(marketRates)

        // calcuate size for market buy
        Decimal.set({ precision: 4, defaults: true })
        const usdValue = new Decimal(accountUsdBalance.free).mul(0.9)
        console.log("==> USD Value:", usdValue.toNumber())
        const size = usdValue.div(marketRates.result.bid)
        console.log("==> Size:", size.toNumber())

        // Add new position
        params.method = "POST"
        params.path = "/api/orders"
        params.order = {
          market: `${market}`,
          type: "market",
          side: "sell",
          price: null,
          size: size.toNumber(),
        }
        // console.log(params)
        const buyRes = await ftxApi(params)
        console.log(buyRes)
      }
    }

    return "==> Done."
  } catch (e) {
    console.log(e)
  }
}

main()
  .then((res) => console.log(res))
  .catch((err) => console.log(err))
