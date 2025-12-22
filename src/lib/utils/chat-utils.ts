/**
 * Normalizes a phone number for use in deep links (WhatsApp/Viber).
 * Removes all non-numeric characters except for the leading '+'.
 */
export const normalizePhoneNumber = (phone: string): string => {
  if (!phone) return "";
  // Remove spaces, dashes, parentheses, and other non-numeric chars
  // Keep the + if it exists at the start
  const cleaned = phone.replace(/[^\d+]/g, "");
  // For WhatsApp, it prefers numbers without the leading + in the URL usually,
  // but wa.me handles both. Viber usually needs the full number.
  return cleaned;
};

/**
 * Formats a WhatsApp deep link.
 */
export const getWhatsAppLink = (phone: string, message: string): string => {
  const normalized = normalizePhoneNumber(phone).replace("+", "");
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${normalized}?text=${encodedMessage}`;
};

/**
 * Formats a Viber deep link.
 */
export const getViberLink = (phone: string): string => {
  const normalized = normalizePhoneNumber(phone);
  return `viber://chat?number=${normalized}`;
};

/**
 * Formats a standard phone link.
 */
export const getPhoneLink = (phone: string): string => {
  const normalized = normalizePhoneNumber(phone);
  return `tel:${normalized}`;
};

/**
 * Generates a professional product inquiry message.
 */
export const formatProductInquiry = (
  productName: string,
  productUrl: string,
  price?: string
): string => {
  let message = `Hello, I am interested in ${productName}.`;
  if (price) {
    message += ` (Price: ${price})`;
  }
  message += `\nLink: ${productUrl}`;
  return message;
};

/**
 * Generates a general shop inquiry message.
 */
export const formatGeneralInquiry = (): string => {
  return "Hello, I have a question about Abaz Exclusive.";
};
