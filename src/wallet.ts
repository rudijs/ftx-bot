// export type directionBias = "BULL" | "BEAR"

export const hasToken = (data: any[], directionBias: "BULL" | "BEAR") => {
  // console.log(data, directionBias)

  const coins = data.filter((item) => {
    // console.log(101, item.coin)
    // const regex = `/${directionBias}/`
    return RegExp(directionBias).test(item.coin) && item.free > 0 && item.total > 0
  })

  // console.log(201, coins)

  return !!coins.length
}
