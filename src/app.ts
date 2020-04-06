import axios, { Method } from "axios"
import { ftxApi, ftxParams } from "./ftxApi"
import simpleMovingAverage from "./simpleMovingAverage"
import { tokenBalance } from "./wallet"
import Decimal from "decimal.js"

if (!process.env.FTX_API_KEY || !process.env.FTX_SECRET) throw new Error("Missing required FTX env vars")

const apiKey = process.env.FTX_API_KEY
const apiSecret = process.env.FTX_SECRET

async function main(): Promise<any> {
  try {
    const args = process.argv.slice()
    let coin: string
    let tokens: any
    let params: ftxParams

    switch (args[2]) {
      case "ALGO":
        coin = "ALGO"
        tokens = {
          BULL: { token: "ALGOBULL", inverse: "ALGOBEAR" },
          BEAR: { token: "ALGOBEAR", inverse: "ALGOBULL" },
        }
        break
      case "ALT":
        coin = "ALT"
        tokens = {
          BULL: { token: "ALTBULL", inverse: "ALTBEAR" },
          BEAR: { token: "ALTBEAR", inverse: "ALTBULL" },
        }
        break
      default:
        coin = "BTC"
        tokens = {
          BULL: { token: "BULL", inverse: "BEAR" },
          BEAR: { token: "BEAR", inverse: "BULL" },
        }
    }

    const market = `${coin}-PERP`

    console.log("==> ===============================================================================")
    console.log(`==> Local Time: ${new Date(Date.now())}`)
    console.log(`==> Coin: ${coin}`)
    console.log(`==> Market: ${market}`)
    console.log(`==> BULL Token: ${tokens.BULL.token}`)
    console.log(`==> BULL Token Inverse: ${tokens.BULL.inverse}`)
    console.log(`==> BEAR Token: ${tokens.BEAR.token}`)
    console.log(`==> BEAR Token Inverse: ${tokens.BEAR.inverse}`)

    // GET /wallet/balances
    let method = "GET" as Method
    let path = "/api/wallet/balances"
    params = { axios, apiKey, apiSecret, method, path }

    let balances = await ftxApi(params)
    console.log("==> Wallet Balances:")
    console.log(balances.result)

    // GET historical data
    const resolution = 60
    const limit = 200
    path = `/api/markets/${market}/candles?resolution=${resolution}&limit=${limit}`

    params = { axios, apiKey, apiSecret, method, path }

    const data = await ftxApi(params)
    console.log("==> GET historical data", data.success)

    // determine the base line bias - bull or bear
    // when bullish only take longs
    // when bearish only take shorts
    const { startTime, sma, position } = simpleMovingAverage(data.result, 200)
    console.log(`==> Start Time: ${startTime}`)
    console.log(`==> Current SMA: ${sma}`)
    console.log(`==> Long Term Bias: ${position}`)

    // Check for and sell any positions in the wrong direction
    // Cancel any Positions in the opposite direction
    console.log(`==> Closing any open positions in the inverse direction...`)
    console.log(`==> Inverse token: ${tokens[position].inverse}`)
    const inverseTokenBalance = tokenBalance(balances.result, tokens[position].inverse)
    if (inverseTokenBalance && inverseTokenBalance.total > 0) {
      params.method = "POST"
      params.path = "/api/orders"
      params.order = {
        market: `${tokens[position].inverse}/USD`,
        type: "market",
        side: "sell",
        price: null,
        size: inverseTokenBalance.total,
      }
      // console.log(params)
      const res = await ftxApi(params)
      console.log(`==> Market sell ${params.order.market}: ${res.success}`)

      // // wait for a few moments for the exchange to process
      await new Promise((resolve) => {
        const delay = 5000
        console.log(`==> Wait: Allow ${delay}ms for exchange to complete the market sell order and update wallet USD balance...`)
        setTimeout(() => resolve(), delay)
      })

      // GET /wallet/balances
      console.log("==> Updating Wallet Balances...")
      method = "GET" as Method
      path = "/api/wallet/balances"
      params = { axios, apiKey, apiSecret, method, path }

      balances = await ftxApi(params)
      console.log("==> Wallet Balances:")
      console.log(balances.result)
    }

    const { sma: sma5 } = simpleMovingAverage(data.result, 5)
    const { sma: sma8 } = simpleMovingAverage(data.result, 8)
    // const { sma: sma13 } = simpleMovingAverage(data.result, 13)
    console.log(`==> Current SMA5: ${sma5}`)
    console.log(`==> Current SMA8: ${sma8}`)
    // console.log(`==> Current SMA13: ${sma13}`)

    if (position === "BULL") {
      // if (sma5 > sma8 && sma8 > sma13) {
      if (sma5 > sma8) {
        console.log(`==> Short Term Bias: BUY ${tokens[position].token}`)

        // do we have a position already?
        const currentPosition = tokenBalance(balances.result, tokens[position].token)
        if (currentPosition && currentPosition.total > 0) {
          console.log(`==> Position OK: ${tokens[position].token}`)
          return "==> Done."
        }

        console.log(`==> Market BUY: ${tokens[position].token}`)

        // get market rates for token
        params.method = "GET"
        params.path = `/api/markets/${tokens[position].token}/USD`
        params.order = undefined
        const marketRates = await ftxApi(params)
        console.log(`==> Market rates for ${tokens[position].token}`)
        console.log(marketRates)

        // calcuate size for market buy
        Decimal.set({ precision: 4, defaults: true })
        const usdBalance = tokenBalance(balances.result, "USD")
        const usdAmount = new Decimal(usdBalance.free).mul(0.9)
        console.log("==> USD Amount to invest:", usdAmount.toNumber())
        const size = usdAmount.div(marketRates.result.bid)
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
      } else {
        console.log(`==> Short Term Bias: SELL ${tokens[position].token}`)
        console.log(`==> Checking for any ${tokens[position].token} to sell...`)
        const marketSellBalance = tokenBalance(balances.result, tokens[position].token)
        // console.log(marketSellBalance)
        if (marketSellBalance && marketSellBalance.total > 0) {
          console.log(`==> Market SELL: ${tokens[position].token}/USD - Amount: ${marketSellBalance.total}`)
          params.method = "POST"
          params.path = "/api/orders"
          params.order = {
            market: `${tokens[position].token}/USD`,
            type: "market",
            side: "sell",
            price: null,
            size: marketSellBalance.total,
          }
          // console.log(params)
          await ftxApi(params)
        } else {
          console.log(`==> No ${tokens[position].token} to sell`)
        }
      }
    }

    if (position === "BEAR") {
      // if (sma5 < sma8 && sma8 < sma13) {
      if (sma5 < sma8) {
        console.log("buy BEAR")
        console.log(`==> Short Term Bias: BUY ${tokens[position].token}`)

        // do we have a position already?
        const currentPosition = tokenBalance(balances.result, tokens[position].token)
        if (currentPosition && currentPosition.total > 0) {
          console.log(`==> Position OK: ${tokens[position].token}`)
          return "==> Done."
        }

        console.log(`==> Market BUY: ${tokens[position].token}`)

        // get market rates for token
        params.method = "GET"
        params.path = `/api/markets/${tokens[position].token}/USD`
        params.order = undefined
        const marketRates = await ftxApi(params)
        console.log(`==> Market rates for ${tokens[position].token}`)
        console.log(marketRates)

        // calcuate size for market buy
        Decimal.set({ precision: 4, defaults: true })
        const usdBalance = tokenBalance(balances.result, "USD")
        const usdAmount = new Decimal(usdBalance.free).mul(0.9)
        console.log("==> USD Amount to invest:", usdAmount.toNumber())
        const size = usdAmount.div(marketRates.result.bid)
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
      } else {
        console.log(`==> Short Term Bias: SELL ${tokens[position].token}`)
        console.log(`==> Checking for any ${tokens[position].token} to sell...`)
        const marketSellBalance = tokenBalance(balances.result, tokens[position].token)
        // console.log(marketSellBalance)
        if (marketSellBalance && marketSellBalance.total > 0) {
          console.log(`==> Market SELL: ${tokens[position].token}/USD - Amount: ${marketSellBalance.total}`)
          params.method = "POST"
          params.path = "/api/orders"
          params.order = {
            market: `${tokens[position].token}/USD`,
            type: "market",
            side: "sell",
            price: null,
            size: marketSellBalance.total,
          }
          // console.log(params)
          const res = await ftxApi(params)
          console.log(`==> Market sell ${params.order.market}: ${res.success}`)
        } else {
          console.log(`==> No ${tokens[position].token} to sell`)
        }
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
