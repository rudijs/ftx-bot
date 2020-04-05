export const hasToken = (data: any[], token: string) => {
  const coins = data.filter((item) => {
    // console.log(101, item.coin)
    const regex = `^${token}\$`
    return RegExp(regex).test(item.coin) && item.free > 0 && item.total > 0
  })

  // console.log(201, coins)

  return !!coins.length
}

export const tokenBalance = (data: any[], token: string) => {
  return data.filter((item) => item.coin === token)[0]
}
