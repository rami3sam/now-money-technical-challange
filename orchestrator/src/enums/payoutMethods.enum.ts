enum PayoutMethods {
    Bank = 'bank',
    Cash = 'cash'
}

export { PayoutMethods }

export const PayoutMethodsValues = Object.values(PayoutMethods) as string[];