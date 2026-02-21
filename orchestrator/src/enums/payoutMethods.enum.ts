enum PayoutMethods {
    Bank = 'BANK',
    Cash = 'CASH'
}

export { PayoutMethods }

export const PayoutMethodsValues = Object.values(PayoutMethods) as string[];