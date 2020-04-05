const crypto = require("crypto")
import { AxiosInstance } from "axios"

type ftxParams = {
  axios: AxiosInstance
  resolution: number
  limit: number
  apiKey: string
  apiSecret: string
}

export default (obj: ftxParams) => {
  const { axios, resolution, limit, apiKey, apiSecret } = obj
  const ts = Date.now()
  const baseUrl = "https://ftx.com/api"
  const method = "GET"
  const market = "BTC-PERP"

  const path = `/markets/${market}/candles?resolution=${resolution}&limit=${limit}`

  const hash = crypto.createHmac("sha256", apiSecret).update(`${ts}${method}${path}`).digest("hex")
  // console.log(hash)

  // curl command line
  // const curlCmd = `curl -H 'FTX-KEY: ${apiKey}' -H 'FTX-SIGN: ${hash}' -H 'FTX-TS: ${ts}' '${baseUrl}${path}'`
  // console.log(curlCmd)

  return axios
    .get(`${baseUrl}${path}`, {
      headers: {
        "FTX-KEY": apiKey,
        "FTX-SIGN": hash,
        "FTX-TS": ts,
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
