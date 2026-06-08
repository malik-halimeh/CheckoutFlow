/**
 * validation.js
 *
 * Centralised validation utilities for the checkout flow.
 * Each validator accepts a value and returns either null (valid)
 * or a human-readable error string that can be rendered inline.
 *
 * Keeping validation outside components gives us three advantages:
 *  1. Single source of truth – changing a rule here fixes it everywhere.
 *  2. Testability – pure functions are trivial to unit-test.
 *  3. Reuse – the custom hook (useCheckoutForm) and individual form
 *     components can all call the same helpers.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when the trimmed value is non-empty.
 * @param {string} value
 * @returns {boolean}
 */
const hasValue = (value) => typeof value === "string" && value.trim().length > 0;

// ---------------------------------------------------------------------------
// Personal Information Validators
// ---------------------------------------------------------------------------

/**
 * Validates the user's full name.
 * Rules: required, minimum 3 characters (covers first + last).
 *
 * @param {string} value
 * @returns {string|null} error message or null if valid
 */
export const validateFullName = (value) => {
  if (!hasValue(value)) return "Full name is required.";
  if (value.trim().length < 3) return "Name must be at least 3 characters long.";
  return null;
};

/**
 * Validates an email address using a broadly-accepted RFC 5322 subset regex.
 * We deliberately keep the regex simple to avoid false negatives on unusual
 * but technically valid addresses.
 *
 * @param {string} value
 * @returns {string|null}
 */
export const validateEmail = (value) => {
  if (!hasValue(value)) return "Email address is required.";
  // Standard email pattern: local-part @ domain . tld
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value.trim())) return "Please enter a valid email address.";
  return null;
};

/**
 * Validates a phone number.
 * Accepts common international formats:
 *   +1 (555) 123-4567, 0044 7911 123456, 555-123-4567, etc.
 * We strip formatting characters and require 7–15 digits (ITU-T E.164 range).
 *
 * @param {string} value
 * @returns {string|null}
 */
export const validatePhone = (value) => {
  if (!hasValue(value)) return "Phone number is required.";
  // Remove spaces, dashes, parentheses, and leading +
  const digits = value.replace(/[\s\-().+]/g, "");
  if (!/^\d{7,15}$/.test(digits))
    return "Please enter a valid phone number (7–15 digits, international formats accepted).";
  return null;
};

// ---------------------------------------------------------------------------
// Address Validators
// ---------------------------------------------------------------------------

/**
 * Validates a generic required text field.
 * Used for Street Address, City, State, Country.
 *
 * @param {string} value
 * @param {string} fieldLabel – used in the error message for specificity
 * @returns {string|null}
 */
export const validateRequiredField = (value, fieldLabel = "This field") => {
  if (!hasValue(value)) return `${fieldLabel} is required.`;
  return null;
};

/**
 * Validates a postal / ZIP code.
 * Accepts US ZIPs (12345 or 12345-6789), UK postcodes, CA, AU, and generic
 * 4–10 character alphanumeric codes used by most countries.
 *
 * @param {string} value
 * @returns {string|null}
 */
export const validatePostalCode = (value) => {
  if (!hasValue(value)) return "Postal code is required.";
  // Covers: US 5-digit, US ZIP+4, CA A1A 1A1, UK, generic 4-10 chars
  const postalRegex = /^[A-Za-z0-9][A-Za-z0-9\s\-]{2,9}$/;
  if (!postalRegex.test(value.trim()))
    return "Please enter a valid postal / ZIP code.";
  return null;
};

// ---------------------------------------------------------------------------
// Payment Validators
// ---------------------------------------------------------------------------

/**
 * Validates the cardholder name printed on the card.
 * Rules: required, minimum 2 characters.
 *
 * @param {string} value
 * @returns {string|null}
 */
export const validateCardholderName = (value) => {
  if (!hasValue(value)) return "Cardholder name is required.";
  if (value.trim().length < 2) return "Please enter the name as it appears on the card.";
  return null;
};

/**
 * Validates a card number after stripping spaces.
 * Uses the Luhn algorithm for structural validity, then checks length (13–19 digits).
 *
 * The Luhn check catches the vast majority of mistyped card numbers without
 * requiring a network round-trip, giving instant user feedback.
 *
 * @param {string} value – may include spaces added by the formatter
 * @returns {string|null}
 */
export const validateCardNumber = (value) => {
  if (!hasValue(value)) return "Card number is required.";
  const digits = value.replace(/\s/g, "");
  if (!/^\d{13,19}$/.test(digits)) return "Card number must be 13–19 digits.";
  if (!luhnCheck(digits)) return "This card number is invalid. Please check and try again.";
  return null;
};

/**
 * Luhn algorithm implementation.
 * Iterates right-to-left, doubling every second digit and subtracting 9
 * when the result exceeds 9. Valid cards produce a total divisible by 10.
 *
 * @param {string} numStr – string of digits only
 * @returns {boolean}
 */
const luhnCheck = (numStr) => {
  let total = 0;
  let isEven = false;
  for (let i = numStr.length - 1; i >= 0; i--) {
    let digit = parseInt(numStr[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    total += digit;
    isEven = !isEven;
  }
  return total % 10 === 0;
};

/**
 * Validates the expiration date in MM/YY format.
 * Rejects months outside 01–12 and dates in the past.
 *
 * @param {string} value – expected "MM/YY"
 * @returns {string|null}
 */
export const validateExpiry = (value) => {
  if (!hasValue(value)) return "Expiration date is required.";
  if (!/^\d{2}\/\d{2}$/.test(value)) return "Please use MM/YY format (e.g., 08/27).";

  const [monthStr, yearStr] = value.split("/");
  const month = parseInt(monthStr, 10);
  const year = parseInt(`20${yearStr}`, 10); // Converts 2-digit to full year

  if (month < 1 || month > 12) return "Month must be between 01 and 12.";

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // getMonth() is 0-indexed

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return "This card has expired. Please use a valid card.";
  }
  return null;
};

/**
 * Validates the CVV security code.
 * Most cards use 3 digits; Amex uses 4.
 *
 * @param {string} value
 * @param {boolean} isAmex – set true when the card type is Amex
 * @returns {string|null}
 */
export const validateCVV = (value, isAmex = false) => {
  if (!hasValue(value)) return "CVV is required.";
  if (!/^\d+$/.test(value)) return "CVV must contain only numbers.";
  const requiredLength = isAmex ? 4 : 3;
  if (value.length !== requiredLength)
    return `CVV must be ${requiredLength} digits${isAmex ? " for American Express cards" : ""}.`;
  return null;
};

// ---------------------------------------------------------------------------
// Batch validators – used by the custom hook before advancing steps
// ---------------------------------------------------------------------------

/**
 * Runs all personal-info validators and returns a flat errors object.
 * Returns {} if everything is valid.
 *
 * @param {{ fullName: string, email: string, phone: string }} data
 * @returns {Object.<string, string>}
 */
export const validatePersonalInfo = (data) => {
  const errors = {};
  const nameErr = validateFullName(data.fullName);
  const emailErr = validateEmail(data.email);
  const phoneErr = validatePhone(data.phone);
  if (nameErr) errors.fullName = nameErr;
  if (emailErr) errors.email = emailErr;
  if (phoneErr) errors.phone = phoneErr;
  return errors;
};

/**
 * Runs all address validators and returns a flat errors object.
 *
 * @param {Object} data
 * @returns {Object.<string, string>}
 */
export const validateAddress = (data) => {
  const errors = {};
  const streetErr = validateRequiredField(data.street, "Street address");
  const cityErr = validateRequiredField(data.city, "City");
  const stateErr = validateRequiredField(data.state, "State / Province");
  const postalErr = validatePostalCode(data.postalCode);
  const countryErr = validateRequiredField(data.country, "Country");

  if (streetErr) errors.street = streetErr;
  if (cityErr) errors.city = cityErr;
  if (stateErr) errors.state = stateErr;
  if (postalErr) errors.postalCode = postalErr;
  if (countryErr) errors.country = countryErr;
  // addressLine2 is optional – no validation needed
  return errors;
};

/**
 * Runs all payment validators and returns a flat errors object.
 *
 * @param {Object} data
 * @param {boolean} isAmex
 * @returns {Object.<string, string>}
 */
export const validatePayment = (data, isAmex = false) => {
  const errors = {};
  const nameErr = validateCardholderName(data.cardholderName);
  const numErr = validateCardNumber(data.cardNumber);
  const expErr = validateExpiry(data.expiry);
  const cvvErr = validateCVV(data.cvv, isAmex);

  if (nameErr) errors.cardholderName = nameErr;
  if (numErr) errors.cardNumber = numErr;
  if (expErr) errors.expiry = expErr;
  if (cvvErr) errors.cvv = cvvErr;
  return errors;
};
