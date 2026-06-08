/**
 * FailureScreen.jsx
 *
 * Displayed when the simulated payment API call returns a failure result.
 * This component provides two recovery paths:
 *   1. "Retry Payment" – re-submits the same data (goes back to processing)
 *   2. "Edit Payment" – returns the user to the Payment form to correct details
 *
 * Accessibility:
 *  - role="alert" and aria-live="assertive" immediately announce the failure
 *    to screen readers when this component mounts
 *  - Focus is programmatically moved to the heading via useRef so keyboard
 *    and screen-reader users know exactly where they are
 *  - Both action buttons have descriptive aria-labels
 *
 * React Concepts:
 *  - useRef  → holds a stable reference to the heading DOM node
 *  - useEffect → runs focus management once on mount
 *  - Props  → all data and callbacks come from App.jsx; this component
 *             has zero internal state
 *
 * Bootstrap Concepts:
 *  - .btn-danger / .btn-outline-secondary → semantic colour coding for
 *    primary/secondary actions
 *  - .alert .alert-danger → red notification block (not used inline, but
 *    the class naming convention is referenced in our custom styles)
 *  - .d-flex, .gap-3 → horizontal button layout
 */

import React, { useEffect, useRef } from "react";

/**
 * FailureScreen
 *
 * Props:
 *  @param {Function} onRetry      – re-attempts payment processing
 *  @param {Function} onEditPayment – navigates back to the payment form
 */
const FailureScreen = ({ onRetry, onEditPayment }) => {
  // React Concept – useRef:
  // Provides a mutable reference to the heading element so we can
  // programmatically focus it without adding the element to the natural
  // Tab order (tabIndex="-1" enables focus() but skips Tab navigation).
  const headingRef = useRef(null);

  // React Concept – useEffect:
  // On mount, shift keyboard/screen-reader focus to the failure heading.
  // This ensures users who just experienced a loading overlay get immediate
  // feedback about the outcome. The empty dependency array [] limits
  // execution to the initial render only.
  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, []);

  return (
    // role="alert" + aria-live="assertive" forces screen readers to
    // announce this content immediately, interrupting any queued speech.
    // This is appropriate for error conditions that require user action.
    <section
      className="result-screen failure-screen"
      role="alert"
      aria-live="assertive"
      aria-labelledby="failure-heading"
    >
      {/* Animated failure icon – purely decorative */}
      <div className="result-icon failure-icon" aria-hidden="true">
        ✕
      </div>

      {/* tabIndex="-1" enables programmatic focus without entering Tab order */}
      <h1
        id="failure-heading"
        className="result-title"
        ref={headingRef}
        tabIndex="-1"
      >
        Payment Failed
      </h1>

      <p className="result-subtitle">
        We were unable to process your payment at this time. This could be due
        to a temporary network issue or an invalid card. Please try again or
        update your payment details.
      </p>

      {/* Error details block – gives the user clear, actionable guidance */}
      <div className="failure-details" role="note">
        <h2 className="failure-details-title">What you can do:</h2>
        <ul className="failure-steps-list">
          <li>
            <span className="step-bullet" aria-hidden="true">1</span>
            Retry the payment — your details have been preserved.
          </li>
          <li>
            <span className="step-bullet" aria-hidden="true">2</span>
            Edit your card information and try a different payment method.
          </li>
          <li>
            <span className="step-bullet" aria-hidden="true">3</span>
            Ensure your card has not expired and has sufficient funds.
          </li>
        </ul>
      </div>

      {/* Action buttons
          Bootstrap Concept – d-flex + gap-3:
          Creates a horizontal flex layout with consistent 1rem (gap-3) spacing
          between the two buttons without needing custom margin rules. */}
      <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 mt-4">
        {/* Primary action: retry with the same payment data */}
        <button
          id="retry-payment-btn"
          type="button"
          className="btn btn-danger btn-xl"
          onClick={onRetry}
          aria-label="Retry the payment with your current details"
        >
          🔄 Retry Payment
        </button>

        {/* Secondary action: return to the payment form to edit */}
        <button
          id="edit-payment-btn"
          type="button"
          className="btn btn-outline-secondary btn-xl"
          onClick={onEditPayment}
          aria-label="Return to the payment form to edit your card details"
        >
          ✏️ Edit Payment Details
        </button>
      </div>

      {/* Reassurance text */}
      <p className="failure-reassurance mt-4">
        <span aria-hidden="true">🔒</span>{" "}
        No charges have been made to your account. Your data remains secure.
      </p>
    </section>
  );
};

export default FailureScreen;
