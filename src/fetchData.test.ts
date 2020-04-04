/**
 * @jest-environment node
 */
import fetchData from "./fetchData"

const axios = require("axios").default

if (!process.env.FTX_API_KEY || !process.env.FTX_SECRET) throw new Error("Missing required FTX env vars")

const apiKey = process.env.FTX_API_KEY
const apiSecret = process.env.FTX_SECRET

describe("fetchData", () => {
  it("should", async () => {
    const res = await fetchData({ axios, apiKey, apiSecret, resolution: 60, limit: 34 })
    // console.log(res)
    expect(res.result.length).toEqual(34)
  })
})
