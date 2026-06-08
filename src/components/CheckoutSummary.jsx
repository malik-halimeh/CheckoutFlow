/**
 * CheckoutSummary.jsx
 *
 * The first screen of the checkout flow.
 * Provides a concise overview of what the user is about to complete
 * (personal info, address, payment) before they begin entering data.
 *
 * This screen intentionally avoids product/e-commerce content – its sole
 * purpose is to orient the user and set expectations for the form journey.
 *
 * Bootstrap Concepts used:
 *  - .card / .card-body  →  content containers with border and padding
 *  - .row / .col-md-4   →  responsive three-column grid at medium breakpoints
 *  - .btn .btn-lg        →  large call-to-action button
 *  - .d-flex / .gap-3    →  flexbox layout with consistent spacing
 */

import React from "react";

/**
 * CheckoutSummary
 *
 * Props:
 *  @param {Function} onStart – callback to advance to the Personal Info step
 */
const CheckoutSummary = ({ onStart }) => {
  // The three steps the user will complete, shown as preview cards.
  // Defined inside the component so they are co-located with the JSX
  // that renders them – no need to lift this to a hook or context.
  const steps = [
    {
      icon: "👤",
      title: "Personal Info",
      description: "Your name, email address, and phone number.",
    },
    {
      icon: "📍",
      title: "Shipping Address",
      description: "Where we'll send your confirmation and correspondence.",
    },
    {
      icon: "💳",
      title: "Payment Details",
      description: "Your credit or debit card information, securely collected.",
    },
  ];

  return (
    // React Concept – component composition:
    // This component is a pure presentational leaf. It renders only markup
    // and calls a single callback prop (onStart) – zero state needed here.
    <section className="checkout-summary-screen" aria-labelledby="summary-heading">
      {/* Header */}
      <div className="text-center mb-5">
        <div className="summary-badge mb-3" aria-hidden="true">
          🔒
        </div>
        <h1 id="summary-heading" className="display-heading">
          Secure Checkout
        </h1>
        <p className="lead-text">
          Complete the three steps below to finish your submission.
          Your information is encrypted and never stored after this session.
        </p>
      </div>

      {/* Bootstrap Grid – three preview cards in a responsive row.
          col-md-4 means each card takes 1/3 width on medium screens and
          above, stacking to full width on mobile. */}
      <div className="row g-4 mb-5">
        {steps.map((item, index) => (
          <div key={item.title} className="col-md-4">
            <div className="summary-step-card card h-100">
              <div className="card-body">
                {/* Step number badge */}
                <div className="step-number" aria-hidden="true">
                  {index + 1}
                </div>
                <div className="step-icon" aria-hidden="true">
                  {item.icon}
                </div>
                <h2 className="step-title">{item.title}</h2>
                <p className="step-description">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Security notice */}
      <div className="security-notice mb-5" role="note">
        <span className="security-icon" aria-hidden="true">🛡️</span>
        <div>
          <strong>Your data is safe.</strong> This form uses client-side
          validation only. No data is transmitted to any server. Information
          exists solely for this session.
        </div>
      </div>

      {/* CTA button – triggers the onStart callback passed by App.jsx */}
      <div className="text-center">
        <button
          id="start-checkout-btn"
          className="btn btn-primary btn-xl"
          onClick={onStart}
          type="button"
          aria-label="Begin checkout – step 1 of 4: Personal Information"
        >
          Begin Checkout
          <span className="btn-arrow ms-2" aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
};

export default CheckoutSummary;
