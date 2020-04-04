const cryptojs = require("crypto")
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
  const method = "GET"

  // const path = "/markets/BTC-PERP"
  // const path = '/markets/{market_name}/candles?resolution={resolution}&limit={limit}&start_time={start_time}&end_time={end_time}'
  const path = `/markets/BTC-PERP/candles?resolution=${resolution}&limit=${limit}`

  const hash = cryptojs.createHmac("sha256", apiSecret).update(`${ts}${method}${path}`).digest("hex")
  // console.log(hash)

  return axios
    .get(`https://ftx.com/api${path}`, {
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
