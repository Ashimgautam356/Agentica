export const TEST_CARD = {
  cardNumber: "4111111111111111",
  expiryMonth: "12",
  cvv: "123",
} as const;

export function checkoutContact(value: string) {
  const contact = value.replace(/\D/g, "");
  return /^\d{10}$/.test(contact) ? contact : null;
}

export function checkoutAddress(value: string) {
  const address = value.trim();
  return address.length >= 5 && address.length <= 240 ? address : null;
}
