/**
 * PaymentForm.jsx
 *
 * Step 3: Collects credit/debit card information.
 *
 * Features:
 *  - Real-time card number formatting (spaces every 4 digits; Amex: 4-6-5)
 *  - Automatic card type detection (Visa, Mastercard, Amex, Discover, etc.)
 *  - Expiry auto-format (MM/YY with auto-inserted slash)
 *  - CVV length adjusts dynamically based on detected card type
 *  - Luhn algorithm validates card number structure on blur
 *  - All fields validated real-time, on-blur, and on submit
 *
 * Accessibility:
 *  - aria-live region announces detected card type to screen readers
 *  - inputmode="numeric" on numeric fields triggers number keyboard on mobile
 *  - autocomplete attributes help password managers and autofill
 *
 * Security note:
 *  This is a frontend-only demo. In production, card numbers should NEVER
 *  be stored in component state; instead use a PCI-compliant iframe/SDK
 *  (Stripe Elements, Braintree Hosted Fields, etc.).
 */

import React, { useState, useCallback } from "react";
import {
  validateCardholderName,
  validateCardNumber,
  validateExpiry,
  validateCVV,
} from "../utils/validation";
import {
  formatCardNumber,
  formatExpiry,
  getCardLabel,
  getCVVLength,
} from "../utils/cardHelpers";

/**
 * PaymentForm
 *
 * Props:
 *  @param {Object}      data     – payment fields from formData.payment
 *  @param {Object}      errors   – submit-time errors from useCheckoutForm
 *  @param {Object|null} cardType – detected card network from the hook
 *  @param {Function}    onChange – updatePayment from useCheckoutForm
 *  @param {Function}    onNext   – advances to Confirmation step
 *  @param {Function}    onBack   – returns to Address step
 */
const PaymentForm = ({ data, errors, cardType, onChange, onNext, onBack }) => {
  const [touched, setTouched] = useState({
    cardholderName: false,
    cardNumber: false,
    expiry: false,
    cvv: false,
  });

  const [localErrors, setLocalErrors] = useState({});

  const isAmex = cardType?.name === "amex";

  /**
   * Validates a single payment field.
   * Note: CVV validation passes isAmex so the expected length is correct.
   */
  const validateField = useCallback(
    (field, value) => {
      let error = null;
      if (field === "cardholderName") error = validateCardholderName(value);
      if (field === "cardNumber") error = validateCardNumber(value);
      if (field === "expiry") error = validateExpiry(value);
      if (field === "cvv") error = validateCVV(value, isAmex);
      setLocalErrors((prev) => ({ ...prev, [field]: error }));
    },
    [isAmex]
  );

  /**
   * Card number change handler:
   * Applies formatting before storing the value so the displayed number
   * always has correct spacing without the user typing spaces manually.
   */
  const handleCardNumberChange = useCallback(
    (e) => {
      // formatCardNumber is called with the current cardType (may be null)
      const formatted = formatCardNumber(e.target.value, cardType);
      onChange({ cardNumber: formatted });
      if (touched.cardNumber) validateField("cardNumber", formatted);
    },
    [cardType, onChange, touched.cardNumber, validateField]
  );

  /**
   * Expiry change handler:
   * formatExpiry auto-inserts the "/" separator so users only type digits.
   */
  const handleExpiryChange = useCallback(
    (e) => {
      const formatted = formatExpiry(e.target.value);
      onChange({ expiry: formatted });
      if (touched.expiry) validateField("expiry", formatted);
    },
    [onChange, touched.expiry, validateField]
  );

  /**
   * CVV change handler:
   * Strips non-digits and caps length based on the detected card type.
   */
  const handleCVVChange = useCallback(
    (e) => {
      const cvvLen = getCVVLength(cardType);
      const digits = e.target.value.replace(/\D/g, "").slice(0, cvvLen);
      onChange({ cvv: digits });
      if (touched.cvv) validateField("cvv", digits);
    },
    [cardType, onChange, touched.cvv, validateField]
  );

  /** Generic handler for cardholder name */
  const handleNameChange = useCallback(
    (e) => {
      onChange({ cardholderName: e.target.value });
      if (touched.cardholderName) validateField("cardholderName", e.target.value);
    },
    [onChange, touched.cardholderName, validateField]
  );

  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      validateField(name, value);
    },
    [validateField]
  );

  const allErrors = { ...localErrors, ...errors };
  const getError = (field) => (touched[field] ? allErrors[field] : null);

  const inputClass = (field) =>
    `form-control ${getError(field) ? "is-invalid" : touched[field] && !getError(field) ? "is-valid" : ""}`;

  return (
    <section aria-labelledby="payment-heading">
      <header className="form-step-header">
        <div className="step-icon-large" aria-hidden="true">💳</div>
        <div>
          <h2 id="payment-heading" className="form-step-title">
            Payment Details
          </h2>
          <p className="form-step-subtitle">
            Enter your card information below. Data is never transmitted or stored.
          </p>
        </div>
      </header>

      {/* Aria-live region: announces card type changes to screen readers
          without interrupting the user's typing flow */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {cardType
          ? `Detected card type: ${getCardLabel(cardType)}`
          : "Card type will be detected automatically."}
      </div>

      <form
        id="payment-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setTouched({
            cardholderName: true,
            cardNumber: true,
            expiry: true,
            cvv: true,
          });
          onNext();
        }}
        aria-label="Payment details form"
      >
        <fieldset>
          <legend className="fieldset-legend">Card Information</legend>

          {/* ---- Cardholder Name ---- */}
          <div className="mb-4">
            <label htmlFor="cardholderName" className="form-label">
              Cardholder Name <span className="required-star" aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              id="cardholderName"
              name="cardholderName"
              className={inputClass("cardholderName")}
              value={data.cardholderName}
              onChange={handleNameChange}
              onBlur={handleBlur}
              required
              autoComplete="cc-name"
              placeholder="As it appears on the card"
              aria-describedby={getError("cardholderName") ? "cardholderName-error" : undefined}
              aria-invalid={getError("cardholderName") ? "true" : "false"}
            />
            {getError("cardholderName") && (
              <div id="cardholderName-error" className="invalid-feedback d-block" role="alert" aria-live="polite">
                ⚠ {getError("cardholderName")}
              </div>
            )}
          </div>

          {/* ---- Card Number ---- */}
          <div className="mb-4">
            <label htmlFor="cardNumber" className="form-label">
              Card Number <span className="required-star" aria-hidden="true">*</span>
            </label>
            {/* Input group combines the text input with the card-type badge */}
            {/* Bootstrap Concept – .input-group wraps input + addons */}
            <div className="input-group">
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                className={inputClass("cardNumber")}
                value={data.cardNumber}
                onChange={handleCardNumberChange}
                onBlur={handleBlur}
                required
                autoComplete="cc-number"
                inputMode="numeric"
                placeholder="1234 5678 9012 3456"
                maxLength={cardType?.name === "amex" ? 17 : 19} // Amex: 15 digits + 2 spaces
                aria-describedby={
                  getError("cardNumber") ? "cardNumber-error" : "cardNumber-hint"
                }
                aria-invalid={getError("cardNumber") ? "true" : "false"}
              />
              {/* Card type badge – visually shows the detected network */}
              <span className={`input-group-text card-type-badge ${cardType ? "detected" : ""}`}>
                {cardType ? (
                  <span title={getCardLabel(cardType)}>
                    {getCardLabel(cardType)}
                  </span>
                ) : (
                  <span className="text-muted">💳</span>
                )}
              </span>
            </div>
            <div id="cardNumber-hint" className="form-hint">
              Visa, Mastercard, Amex, Discover and more are accepted.
            </div>
            {getError("cardNumber") && (
              <div id="cardNumber-error" className="invalid-feedback d-block" role="alert" aria-live="polite">
                ⚠ {getError("cardNumber")}
              </div>
            )}
            {touched.cardNumber && !getError("cardNumber") && (
              <div className="valid-feedback d-block">✓ Card number looks valid.</div>
            )}
          </div>

          {/* ---- Expiry + CVV (side by side) ---- */}
          {/* Bootstrap Concept – .row .col-6 creates a 50/50 split */}
          <div className="row">
            <div className="col-6 mb-4">
              <label htmlFor="expiry" className="form-label">
                Expiry Date <span className="required-star" aria-hidden="true">*</span>
              </label>
              <input
                type="text"
                id="expiry"
                name="expiry"
                className={inputClass("expiry")}
                value={data.expiry}
                onChange={handleExpiryChange}
                onBlur={handleBlur}
                required
                autoComplete="cc-exp"
                inputMode="numeric"
                placeholder="MM/YY"
                maxLength={5}
                aria-describedby={getError("expiry") ? "expiry-error" : "expiry-hint"}
                aria-invalid={getError("expiry") ? "true" : "false"}
              />
              <div id="expiry-hint" className="form-hint">MM/YY</div>
              {getError("expiry") && (
                <div id="expiry-error" className="invalid-feedback d-block" role="alert" aria-live="polite">
                  ⚠ {getError("expiry")}
                </div>
              )}
            </div>

            <div className="col-6 mb-4">
              <label htmlFor="cvv" className="form-label">
                CVV <span className="required-star" aria-hidden="true">*</span>
              </label>
              <input
                type="password" // type="password" prevents shoulder-surfing
                id="cvv"
                name="cvv"
                className={inputClass("cvv")}
                value={data.cvv}
                onChange={handleCVVChange}
                onBlur={handleBlur}
                required
                autoComplete="cc-csc"
                inputMode="numeric"
                placeholder={isAmex ? "4 digits" : "3 digits"}
                maxLength={getCVVLength(cardType)}
                aria-describedby={getError("cvv") ? "cvv-error" : "cvv-hint"}
                aria-invalid={getError("cvv") ? "true" : "false"}
              />
              <div id="cvv-hint" className="form-hint">
                {isAmex
                  ? "4-digit code on the front of your Amex card."
                  : "3-digit code on the back of your card."}
              </div>
              {getError("cvv") && (
                <div id="cvv-error" className="invalid-feedback d-block" role="alert" aria-live="polite">
                  ⚠ {getError("cvv")}
                </div>
              )}
            </div>
          </div>
        </fieldset>

        {/* Secure badge */}
        <div className="secure-badge mb-4" role="note">
          <span aria-hidden="true">🔒</span>
          <small>
            Your payment details are handled securely in this demo environment.
            No data leaves your browser.
          </small>
        </div>

        {/* Navigation */}
        <div className="d-flex justify-content-between gap-3 form-actions">
          <button
            type="button"
            className="btn btn-outline-secondary btn-nav"
            onClick={onBack}
            aria-label="Go back to address information"
          >
            ← Back
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-nav"
            aria-label="Review your order details"
          >
            Review Order →
          </button>
        </div>
      </form>
    </section>
  );
};

export default PaymentForm;
