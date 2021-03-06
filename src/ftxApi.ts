const crypto = require("crypto")
import { AxiosInstance, Method } from "axios"

export type ftxParams = {
  axios: AxiosInstance
  apiKey: string
  apiSecret: string
  subAccount: string
  method: Method
  path: string
  order?: ftxOrder
}

export type ftxOrder = {
  market: string
  type: "market"
  side: "sell" | "buy"
  price: null
  size: number
  reduceOnly?: boolean
}

export const ftxApi = (obj: ftxParams) => {
  const { axios, apiKey, apiSecret, subAccount, method, path, order } = obj
  // console.log(apiKey, apiSecret, method, path)

  const baseUrl = "https://ftx.com"

  const ts = Date.now()

  let payload = ""

  if (order) {
    payload = JSON.stringify(order)
  }

  // console.log(101, `${ts}${method}${path}${payload}`)

  const signature = crypto.createHmac("sha256", apiSecret).update(`${ts}${method}${path}${payload}`).digest("hex")
  // console.log(signature)

  // // curl command line
  // // GET
  // let curlCmd = `curl -H 'FTX-SUBACCOUNT: ${subAccount}' -H 'FTX-KEY: ${apiKey}' -H 'FTX-SIGN: ${signature}' -H 'FTX-TS: ${ts}'`
  // // POST
  // if (method === "POST") {
  //   curlCmd = `${curlCmd} -H 'Content-Type: application/json' -X POST -d '${JSON.stringify(order)}'`
  // }
  // // CLI Command to copy/paste0
  // console.log(`${curlCmd} '${baseUrl}${path}'`)

  const headers: any = {
    "content-type": "application/json",
    "FTX-KEY": apiKey,
    "FTX-SIGN": signature,
    "FTX-TS": ts,
  }

  if (subAccount) {
    headers["FTX-SUBACCOUNT"] = subAccount
  }

  return axios({
    baseURL: baseUrl,
    url: path,
    method: method,
    headers,
    data: payload,
  })
    .then(function (response) {
      // handle success
      // console.log(response.data)
      return response.data
    })
    .catch(function (error: any) {
      // handle error
      // console.log(201, error)
      // console.log(error.message)
      throw error.response.data
      // return error
    })
}
