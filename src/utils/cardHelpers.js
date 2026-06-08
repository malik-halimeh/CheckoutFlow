/**
 * cardHelpers.js
 *
 * Utility functions for real-time credit card input formatting and
 * automatic card-type detection. Keeping these helpers separate from
 * components ensures the logic is reusable, testable, and easy to maintain.
 */

// ---------------------------------------------------------------------------
// Card Network Definitions
// ---------------------------------------------------------------------------

/**
 * Each entry maps a card network name to:
 *  - pattern: regex that matches the card's leading digits (IIN/BIN range)
 *  - lengths: valid total digit lengths for this network
 *  - cvvLength: number of CVV digits (4 for Amex, 3 for others)
 *  - format: regex used to insert spaces at the right positions
 *
 * Patterns are ordered from most-specific (Amex, Discover sub-ranges) to
 * least-specific (generic Visa) so the first match wins.
 */
const CARD_NETWORKS = [
  {
    name: "amex",
    label: "American Express",
    pattern: /^3[47]/,          // Starts with 34 or 37
    lengths: [15],
    cvvLength: 4,
    // Amex format: 4-6-5 grouping  →  XXXX XXXXXX XXXXX
    format: /(\d{1,4})(\d{1,6})?(\d{1,5})?/,
    icon: "💳",                  // Could be replaced with an SVG sprite
  },
  {
    name: "discover",
    label: "Discover",
    pattern: /^6(?:011|5)/,     // Starts with 6011 or 65
    lengths: [16, 19],
    cvvLength: 3,
    format: /(\d{1,4})(\d{1,4})?(\d{1,4})?(\d{1,4})?/,
    icon: "💳",
  },
  {
    name: "mastercard",
    label: "Mastercard",
    // IIN ranges: 51–55 (classic) + 2221–2720 (new range)
    pattern: /^(?:5[1-5]|2[2-7])/,
    lengths: [16],
    cvvLength: 3,
    format: /(\d{1,4})(\d{1,4})?(\d{1,4})?(\d{1,4})?/,
    icon: "💳",
  },
  {
    name: "visa",
    label: "Visa",
    pattern: /^4/,              // All Visa cards start with 4
    lengths: [13, 16, 19],
    cvvLength: 3,
    format: /(\d{1,4})(\d{1,4})?(\d{1,4})?(\d{1,4})?/,
    icon: "💳",
  },
  {
    name: "unionpay",
    label: "UnionPay",
    pattern: /^62/,
    lengths: [16, 17, 18, 19],
    cvvLength: 3,
    format: /(\d{1,4})(\d{1,4})?(\d{1,4})?(\d{1,4})?/,
    icon: "💳",
  },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Detects the card network from the current (unformatted) digit string.
 * Returns the matching network object or null if the number is too short
 * to identify or doesn't match any known pattern.
 *
 * This is called on every keystroke so the UI can update the card badge
 * and adjust CVV length in real time.
 *
 * @param {string} digits – raw digits only, no spaces
 * @returns {Object|null} matching network definition or null
 */
export const detectCardType = (digits) => {
  if (!digits || digits.length < 1) return null;
  return CARD_NETWORKS.find((network) => network.pattern.test(digits)) || null;
};

/**
 * Formats a raw digit string into the card's display format by inserting
 * spaces at network-defined positions.
 *
 * For Amex: "371449635398431" → "3714 496353 98431"
 * For others: "4111111111111111" → "4111 1111 1111 1111"
 *
 * Capping at maxLength prevents users from typing too many digits.
 *
 * @param {string} rawValue – the unformatted input value (may include spaces)
 * @param {Object|null} cardType – result of detectCardType()
 * @returns {string} space-delimited formatted card number
 */
export const formatCardNumber = (rawValue, cardType) => {
  // Strip everything except digits
  const digits = rawValue.replace(/\D/g, "");

  // Determine the maximum digit count for this network (or default to 16)
  const maxLength = cardType ? Math.max(...cardType.lengths) : 16;
  const capped = digits.slice(0, maxLength);

  if (!cardType || cardType.name !== "amex") {
    // Standard 4-4-4-4 grouping for Visa, Mastercard, Discover, etc.
    return capped.replace(/(.{4})/g, "$1 ").trim();
  } else {
    // Amex 4-6-5 grouping
    const match = capped.match(/^(\d{0,4})(\d{0,6})(\d{0,5})$/);
    if (!match) return capped;
    return [match[1], match[2], match[3]].filter(Boolean).join(" ");
  }
};

/**
 * Formats the expiry field as MM/YY in real time.
 * Automatically inserts the slash after two month digits are entered
 * and removes it when the user backspaces past it.
 *
 * @param {string} rawValue – current input value
 * @returns {string} formatted MM/YY string (max 5 characters)
 */
export const formatExpiry = (rawValue) => {
  // Strip everything that isn't a digit
  const digits = rawValue.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) return digits;           // Still entering the month
  return `${digits.slice(0, 2)}/${digits.slice(2)}`; // Insert slash separator
};

/**
 * Masks a card number to show only the last 4 digits.
 * Used on the confirmation screen where we display collected data
 * without exposing sensitive information.
 *
 * Example: "4111 1111 1111 1111" → "**** **** **** 1111"
 *
 * @param {string} formattedNumber – space-formatted card number
 * @returns {string} masked card number
 */
export const maskCardNumber = (formattedNumber) => {
  if (!formattedNumber) return "";
  const digits = formattedNumber.replace(/\s/g, "");
  const last4 = digits.slice(-4);
  const maskedLength = digits.length - 4;
  // Build a string of asterisks and reformat with spaces
  const masked = ("*".repeat(maskedLength) + last4)
    .replace(/(.{4})/g, "$1 ")
    .trim();
  return masked;
};

/**
 * Returns the expected CVV digit length for the currently detected card type.
 * Defaults to 3 for unknown / generic cards.
 *
 * @param {Object|null} cardType
 * @returns {number}
 */
export const getCVVLength = (cardType) => {
  return cardType?.cvvLength ?? 3;
};

/**
 * Returns a human-readable label for the detected card type.
 * Used for aria-live announcements and UI badges.
 *
 * @param {Object|null} cardType
 * @returns {string}
 */
export const getCardLabel = (cardType) => {
  return cardType?.label ?? "Unknown";
};

/**
 * Generates a pseudo-random alphanumeric reference number for the
 * success confirmation screen. This simulates what a real payment
 * processor would return as a transaction ID.
 *
 * Format: "CHK-XXXXXXXX" where X is an uppercase hex character.
 *
 * @returns {string}
 */
export const generateReferenceNumber = () => {
  const hex = Math.random().toString(16).slice(2, 10).toUpperCase();
  return `CHK-${hex}`;
};
