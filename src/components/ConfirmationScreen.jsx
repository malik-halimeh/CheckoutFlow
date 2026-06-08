/**
 * ConfirmationScreen.jsx
 *
 * Step 4 (final review): Displays all collected data before the user
 * confirms payment. Sensitive payment info is masked for security.
 *
 * Key responsibilities:
 *  - Summarise Personal, Address, and Payment data in read-only sections
 *  - Mask the card number (show only last 4 digits)
 *  - Provide "Edit" links for each section so users can correct mistakes
 *  - Trigger payment processing on "Confirm Payment"
 *
 * React Concepts:
 *  - Props drilling: formData and goToStep are passed down from App.jsx
 *  - Conditional rendering: sections render their data only when present
 *
 * Bootstrap Concepts:
 *  - .card / .card-header / .card-body  → structured content sections
 *  - .table / .table-borderless         → clean label/value layout
 *  - .badge                             → inline card-type indicator
 *  - .btn-warning                       → high-visibility confirm button
 */

import React from "react";
import { STEPS } from "../hooks/useCheckoutForm";
import { maskCardNumber, getCardLabel } from "../utils/cardHelpers";

/**
 * SummaryRow
 *
 * A small reusable presentational component that renders one label/value
 * pair inside a table row. Extracted to keep the main component clean.
 *
 * @param {string} label – the field label (left column)
 * @param {string|React.ReactNode} value – the field value (right column)
 */
const SummaryRow = ({ label, value }) => (
  <tr>
    <th scope="row" className="summary-label">{label}</th>
    <td className="summary-value">{value || <span className="text-muted">—</span>}</td>
  </tr>
);

/**
 * ConfirmationScreen
 *
 * Props:
 *  @param {Object}   formData  – all collected form data from useCheckoutForm
 *  @param {Object|null} cardType – detected card network
 *  @param {Function} goToStep  – navigate to a specific step for editing
 *  @param {Function} onConfirm – triggers payment processing
 *  @param {Function} onBack    – returns to payment step
 */
const ConfirmationScreen = ({ formData, cardType, goToStep, onConfirm, onBack }) => {
  const { personal, address, payment } = formData;

  // Mask card number: "4111 1111 1111 1111" → "**** **** **** 1111"
  const maskedCard = maskCardNumber(payment.cardNumber);

  return (
    <section aria-labelledby="confirmation-heading">
      <header className="form-step-header">
        <div className="step-icon-large" aria-hidden="true">✅</div>
        <div>
          <h2 id="confirmation-heading" className="form-step-title">
            Review Your Details
          </h2>
          <p className="form-step-subtitle">
            Please check everything before confirming. You can edit any section.
          </p>
        </div>
      </header>

      {/* ----------------------------------------------------------------
          Personal Information Summary
          ---------------------------------------------------------------- */}
      <div className="summary-card card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span className="summary-section-title">
            <span aria-hidden="true">👤</span> Personal Information
          </span>
          {/* Edit button navigates back to that specific step */}
          <button
            type="button"
            className="btn btn-sm btn-edit"
            onClick={() => goToStep(STEPS.PERSONAL)}
            aria-label="Edit personal information"
          >
            Edit
          </button>
        </div>
        <div className="card-body p-0">
          {/* Bootstrap Concept – .table .table-borderless creates a clean
              grid layout without visible borders between rows. */}
          <table className="table table-borderless mb-0 summary-table">
            <tbody>
              <SummaryRow label="Full Name" value={personal.fullName} />
              <SummaryRow label="Email" value={personal.email} />
              <SummaryRow label="Phone" value={personal.phone} />
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------------------------------------------------------
          Address Summary
          ---------------------------------------------------------------- */}
      <div className="summary-card card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span className="summary-section-title">
            <span aria-hidden="true">📍</span> Shipping Address
          </span>
          <button
            type="button"
            className="btn btn-sm btn-edit"
            onClick={() => goToStep(STEPS.ADDRESS)}
            aria-label="Edit shipping address"
          >
            Edit
          </button>
        </div>
        <div className="card-body p-0">
          <table className="table table-borderless mb-0 summary-table">
            <tbody>
              <SummaryRow label="Street" value={address.street} />
              {address.addressLine2 && (
                <SummaryRow label="Line 2" value={address.addressLine2} />
              )}
              <SummaryRow label="City" value={address.city} />
              <SummaryRow label="State / Province" value={address.state} />
              <SummaryRow label="Postal Code" value={address.postalCode} />
              <SummaryRow label="Country" value={address.country} />
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------------------------------------------------------
          Payment Summary – sensitive data masked
          ---------------------------------------------------------------- */}
      <div className="summary-card card mb-5">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span className="summary-section-title">
            <span aria-hidden="true">💳</span> Payment Details
          </span>
          <button
            type="button"
            className="btn btn-sm btn-edit"
            onClick={() => goToStep(STEPS.PAYMENT)}
            aria-label="Edit payment details"
          >
            Edit
          </button>
        </div>
        <div className="card-body p-0">
          <table className="table table-borderless mb-0 summary-table">
            <tbody>
              <SummaryRow label="Cardholder" value={payment.cardholderName} />
              <SummaryRow
                label="Card Number"
                value={
                  <span className="masked-card" aria-label={`Card ending in ${payment.cardNumber.slice(-4)}`}>
                    <code>{maskedCard}</code>
                    {cardType && (
                      // Bootstrap Concept – .badge is a small inline label component
                      <span className="badge card-network-badge ms-2">
                        {getCardLabel(cardType)}
                      </span>
                    )}
                  </span>
                }
              />
              <SummaryRow label="Expires" value={payment.expiry} />
              <SummaryRow
                label="CVV"
                value={<code aria-label="CVV hidden">{"•".repeat(payment.cvv.length)}</code>}
              />
            </tbody>
          </table>
        </div>
      </div>

      {/* Legal disclaimer */}
      <p className="legal-text mb-4">
        By clicking <strong>Confirm Payment</strong> you acknowledge that this is a
        simulated checkout demonstration and no real transaction will occur.
      </p>

      {/* Navigation */}
      <div className="d-flex justify-content-between gap-3 form-actions">
        <button
          type="button"
          className="btn btn-outline-secondary btn-nav"
          onClick={onBack}
          aria-label="Go back to payment details"
        >
          ← Back
        </button>
        <button
          type="button"
          id="confirm-payment-btn"
          className="btn btn-confirm btn-nav"
          onClick={onConfirm}
          aria-label="Confirm payment and process your order"
        >
          🔒 Confirm Payment
        </button>
      </div>
    </section>
  );
};

export default ConfirmationScreen;
