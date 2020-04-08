import axios, { Method } from "axios"
import { ftxApi, ftxParams } from "./ftxApi"

if (!process.env.FTX_API_KEY || !process.env.FTX_SECRET) throw new Error("Missing required FTX env vars")

const apiKey = process.env.FTX_API_KEY
const apiSecret = process.env.FTX_SECRET

async function main(): Promise<any> {
  try {
    console.log("==> ===============================================================================")
    console.log(`==> Local Time: ${new Date(Date.now())}`)

    let params: ftxParams

    // GET /wallet/balances
    let method = "GET" as Method
    let path = "/api/wallet/all_balances"
    params = { axios, apiKey, apiSecret, subAccount: "", method, path }

    let balances = await ftxApi(params)
    console.log("==> Wallet Balances:")
    // console.log(balances.result)
    // console.log(balances)

    for (const property in balances.result) {
      // console.log(`${property}:`)
      // console.log(`${property}: ${balances.result[property]}`)
      const usd = balances.result[property].filter((item: any) => item.coin === "USD")[0].total
      console.log(`==> ${property}: ${usd}`)
    }

    return "==> Done."
  } catch (e) {
    console.log("==> Error:")
    console.log(e)
  }
}

main()
  .then((res) => console.log(res))
  .catch((err) => console.log(err))
