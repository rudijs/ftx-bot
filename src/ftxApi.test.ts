/**
 * @jest-environment node
 */
import { ftxApi, ftxParams } from "./ftxApi"
import axios from "axios"

if (!process.env.FTX_API_KEY || !process.env.FTX_SECRET) throw new Error("Missing required FTX env vars")

const apiKey = process.env.FTX_API_KEY
const apiSecret = process.env.FTX_SECRET

describe("ftxApi", () => {
  test("should get GET balances", async () => {
    const method = "GET"
    const path = `/api/wallet/balances`

    const params: ftxParams = {
      axios,
      apiKey,
      apiSecret,
      method,
      path,
    }
    const res = await ftxApi(params)
    // console.log(res)
    expect(res.success).toBeTruthy()
  })

  test("should GET historical data", async () => {
    const method = "GET"
    const market = "BTC-PERP"
    const resolution = 60
    const limit = 200
    const path = `/api/markets/${market}/candles?resolution=${resolution}&limit=${limit}`

    const params: ftxParams = {
      axios,
      apiKey,
      apiSecret,
      method,
      path,
    }

    const res = await ftxApi(params)
    // console.log(res.result)
    expect(res.success).toBeTruthy()
    expect(res.result.length).toEqual(200)
  })
})
