const crypto = require("crypto")
import { AxiosInstance } from "axios"

export type ftxParams = {
  axios: AxiosInstance
  apiKey: string
  apiSecret: string
  method: string
  path: string
}

export const ftxApi = (obj: ftxParams) => {
  const { axios, apiKey, apiSecret, method, path } = obj
  // console.log(apiKey, apiSecret, method, path)

  const baseUrl = "https://ftx.com"
  const subAccount = "BTC-Perp"

  const ts = Date.now()

  // console.log(101, `${ts}${method}${path}`)

  const signature = crypto.createHmac("sha256", apiSecret).update(`${ts}${method}${path}`).digest("hex")
  // console.log(signature)

  // curl command line
  // const curlCmd = `curl -H 'FTX-SUBACCOUNT: ${subAccount}' -H 'FTX-KEY: ${apiKey}' -H 'FTX-SIGN: ${signature}' -H 'FTX-TS: ${ts}' '${baseUrl}${path}'`
  // console.log(curlCmd)

  return axios
    .get(`${baseUrl}${path}`, {
      headers: {
        "content-type": "application/json",
        "FTX-KEY": apiKey,
        "FTX-SIGN": signature,
        "FTX-TS": ts,
        "FTX-SUBACCOUNT": subAccount,
      },
    })
    .then(function (response) {
      // handle success
      // console.log(response.data)
      return response.data
    })
    .catch(function (error: any) {
      // handle error
      // console.log(error)
      return error
    })
}
