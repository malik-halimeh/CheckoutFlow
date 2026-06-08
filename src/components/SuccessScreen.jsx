/**
 * SuccessScreen.jsx
 *
 * Displayed when the simulated payment API call returns a success result.
 * This is a purely presentational component – all data (reference number,
 * user name) is passed via props from App.jsx.
 *
 * UX decisions:
 *  - Large celebratory icon and heading create an immediately positive tone
 *  - The reference number is displayed prominently for record-keeping
 *  - "Start Over" resets the entire form session
 *
 * Accessibility:
 *  - role="alert" and aria-live="assertive" ensure screen readers announce
 *    the success message immediately when this component mounts
 *  - The heading is the first focusable element via the tabIndex="-1" trick,
 *    allowing focus management from the parent
 *
 * Bootstrap Concepts:
 *  - .alert .alert-success → green-bordered notification block
 *  - .display-* classes   → large typographic headings
 *  - .btn-lg              → large, prominent call-to-action
 */

import React, { useEffect, useRef } from "react";

/**
 * SuccessScreen
 *
 * Props:
 *  @param {string}   referenceNumber – generated transaction reference (e.g. "CHK-3F2A1B9C")
 *  @param {string}   userName        – the user's full name for personalisation
 *  @param {Function} onStartOver     – resets the form and returns to the summary
 */
const SuccessScreen = ({ referenceNumber, userName, onStartOver }) => {
  // React Concept – useRef:
  // useRef gives us a mutable reference to a DOM node without causing
  // re-renders when it changes. Here we use it to move focus to the
  // heading when the component mounts, providing clear screen-reader context.
  const headingRef = useRef(null);

  // React Concept – useEffect:
  // Runs after the component is inserted into the DOM. The empty dependency
  // array [] means this only fires once (on mount), making it the right
  // place for one-time side effects like focus management.
  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, []);

  return (
    // role="alert" + aria-live="assertive" announces this content to
    // screen readers immediately when it appears in the DOM.
    <section
      className="result-screen success-screen"
      role="alert"
      aria-live="assertive"
      aria-labelledby="success-heading"
    >
      {/* Animated success icon */}
      <div className="result-icon success-icon" aria-hidden="true">
        ✓
      </div>

      {/* tabIndex="-1" allows programmatic focus without adding the heading
          to the keyboard Tab order (it's not interactive). */}
      <h1
        id="success-heading"
        className="result-title"
        ref={headingRef}
        tabIndex="-1"
      >
        Payment Successful!
      </h1>

      <p className="result-subtitle">
        {userName ? `Thank you, ${userName.split(" ")[0]}!` : "Thank you!"}{" "}
        Your submission has been received and confirmed.
      </p>

      {/* Reference number block */}
      <div className="reference-block" aria-label={`Your reference number is ${referenceNumber}`}>
        <p className="reference-label">Confirmation Reference</p>
        <code className="reference-number">{referenceNumber}</code>
        <p className="reference-hint">
          Please save this reference for your records.
        </p>
      </div>

      {/* What's next checklist */}
      <div className="next-steps" role="note" aria-label="What happens next">
        <h2 className="next-steps-title">What happens next?</h2>
        <ul className="next-steps-list">
          <li>
            <span className="check-icon" aria-hidden="true">✓</span>
            A confirmation will be sent to your registered email address.
          </li>
          <li>
            <span className="check-icon" aria-hidden="true">✓</span>
            Your reference number has been logged for this session.
          </li>
          <li>
            <span className="check-icon" aria-hidden="true">✓</span>
            No further action is required from you at this time.
          </li>
        </ul>
      </div>

      {/* CTA */}
      <button
        id="start-over-btn"
        type="button"
        className="btn btn-primary btn-xl mt-4"
        onClick={onStartOver}
        aria-label="Start a new checkout session"
      >
        Start Over
      </button>
    </section>
  );
};

export default SuccessScreen;
