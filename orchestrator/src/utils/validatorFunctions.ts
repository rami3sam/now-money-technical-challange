export function isValidMoney(value: string): boolean {
  const moneyRegex = /^\d+(\.\d{1,2})?$/;
  return moneyRegex.test(value);
}

export function allValuesProvidedValidator(objectKeys: string[]) {
  return (value: Record<string, any>) => {
    const keys = objectKeys.filter((key) => !["_id", "__v"].includes(key));
    return keys.every((key) => value?.[key] != null);
  };
}

export function validateDate(val: string): boolean {
  return !isNaN(Date.parse(val));
}
