import { hasToken } from "./wallet"
import dataBULL from "./fixtures/http_200_wallet_balances_BULL.json"
import dataBEAR from "./fixtures/http_200_wallet_balances_BEAR.json"

describe("wallet", () => {
  describe("with BULL tokens", () => {
    test("should return true for BULL tokens", () => {
      // console.log(dataBULL)
      expect(hasToken(dataBULL.result, "BULL")).toBeTruthy()
    })

    test("should return false for BEAR tokens", () => {
      expect(hasToken(dataBULL.result, "BEAR")).toBeFalsy()
    })
  })

  describe("with BEAR tokens", () => {
    test("should return true for BEAR tokens", () => {
      expect(hasToken(dataBEAR.result, "BEAR")).toBeTruthy()
    })

    test("should return false for BULL tokens", () => {
      expect(hasToken(dataBEAR.result, "BULL")).toBeFalsy()
    })
  })

  describe("with BULL tokens that have zero balance", () => {
    test("should return false for BULL tokens", () => {
      expect(hasToken(dataBEAR.result, "BULL")).toBeFalsy()
    })
  })
})
