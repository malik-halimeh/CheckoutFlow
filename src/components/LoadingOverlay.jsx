/**
 * LoadingOverlay.jsx
 *
 * Full-screen overlay displayed during payment processing.
 * Covers the entire viewport so the user cannot interact with the form
 * while the simulated API call is in progress.
 *
 * Accessibility:
 *  - role="status" and aria-live="polite" announce the loading state
 *    to screen readers without interrupting the current focus
 *  - aria-label provides a full description of what is happening
 *  - The overlay is a <dialog>-like region; focus is managed by the
 *    parent (the form controls are simply hidden beneath the overlay)
 *
 * Bootstrap Concepts:
 *  - .spinner-border → Bootstrap's built-in CSS spinner animation
 *  - .visually-hidden → hides text visually but keeps it for screen readers
 *    (Bootstrap's accessible utility, same as sr-only in older versions)
 */

import React from "react";

/**
 * LoadingOverlay
 *
 * No props required – this component is purely presentational and is
 * rendered conditionally by App.jsx when step === STEPS.PROCESSING.
 */
const LoadingOverlay = () => {
  return (
    // The overlay covers the full viewport using fixed positioning defined in checkout.css.
    // role="status" + aria-live="polite" tells screen readers something is loading.
    <div
      className="loading-overlay"
      role="status"
      aria-live="polite"
      aria-label="Processing your payment, please wait"
    >
      <div className="loading-content">
        {/* Bootstrap Concept – .spinner-border creates a CSS-animated ring.
            The visually-hidden span inside provides accessible text for
            screen readers ("Loading...") while the spinner is purely visual. */}
        <div className="spinner-wrapper" aria-hidden="true">
          <div className="checkout-spinner" />
        </div>

        <h2 className="loading-title">Processing Payment</h2>
        <p className="loading-subtitle">
          Please wait while we securely process your details…
        </p>

        {/* Animated progress dots for visual interest */}
        <div className="loading-dots" aria-hidden="true">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>

        {/* Security reassurance */}
        <p className="loading-secure">
          <span aria-hidden="true">🔒</span> Encrypted &amp; Secure
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
