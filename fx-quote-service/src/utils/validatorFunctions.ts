export function isValidMoney(value: string): boolean {
  const moneyRegex = /^\d+(\.\d{1,2})?$/
  return moneyRegex.test(value)
}