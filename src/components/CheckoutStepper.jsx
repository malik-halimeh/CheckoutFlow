/**
 * CheckoutStepper.jsx
 *
 * A visual progress indicator showing which step the user is on and
 * which steps have been completed. It is purely presentational – it
 * receives the current step number as a prop and renders accordingly.
 *
 * Accessibility:
 *  - Uses role="list" / role="listitem" semantics so screen readers
 *    announce "Step 1 of 4: Personal Info, completed" etc.
 *  - The aria-current="step" attribute marks the active step.
 *  - The aria-label on the wrapping <nav> provides context.
 */

import React from "react";
import { STEPS } from "../hooks/useCheckoutForm";

// ---------------------------------------------------------------------------
// Step metadata – label + icon for each interactive step
// We only show steps 1–5 (SUMMARY through CONFIRMATION) in the stepper;
// PROCESSING / SUCCESS / FAILURE are full-screen overlays, not steps.
// ---------------------------------------------------------------------------
const STEP_META = [
  { step: STEPS.SUMMARY, label: "Overview", icon: "📋" },
  { step: STEPS.PERSONAL, label: "Personal", icon: "👤" },
  { step: STEPS.ADDRESS, label: "Address", icon: "📍" },
  { step: STEPS.PAYMENT, label: "Payment", icon: "💳" },
  { step: STEPS.CONFIRMATION, label: "Review", icon: "✅" },
];

/**
 * CheckoutStepper
 *
 * Props:
 *  @param {number} currentStep – the active STEPS value from useCheckoutForm
 */
const CheckoutStepper = ({ currentStep }) => {
  // Don't render the stepper during processing / success / failure flows
  if (currentStep >= STEPS.PROCESSING) return null;

  return (
    // Bootstrap Concept – d-flex / justify-content-center:
    // These utility classes create a horizontal flexbox layout centred in the
    // container without writing any custom CSS.
    <nav aria-label="Checkout progress steps" className="checkout-stepper">
      <ol
        className="d-flex justify-content-center align-items-center list-unstyled p-0 m-0 flex-wrap gap-0"
        role="list"
      >
        {STEP_META.map(({ step, label, icon }, index) => {
          const isCompleted = currentStep > step;
          const isActive = currentStep === step;
          const isUpcoming = currentStep < step;

          // Build accessible label for screen readers
          const srLabel = isCompleted
            ? `${label}: completed`
            : isActive
            ? `${label}: current step`
            : `${label}: upcoming`;

          return (
            <React.Fragment key={step}>
              {/* Step circle + label */}
              <li
                role="listitem"
                aria-current={isActive ? "step" : undefined}
                aria-label={srLabel}
                className={`stepper-step ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""} ${isUpcoming ? "upcoming" : ""}`}
              >
                <span className="stepper-icon" aria-hidden="true">
                  {/* Show a checkmark when the step is completed */}
                  {isCompleted ? "✓" : icon}
                </span>
                <span className="stepper-label">{label}</span>
              </li>

              {/* Connector line between steps (not after the last step) */}
              {index < STEP_META.length - 1 && (
                <li
                  aria-hidden="true"
                  className={`stepper-connector ${isCompleted ? "completed" : ""}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </ol>

      {/* Progress bar beneath the steps for an additional visual cue */}
      <div className="stepper-progress-track" role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={STEPS.SUMMARY}
        aria-valuemax={STEPS.CONFIRMATION}
        aria-label={`Step ${currentStep + 1} of ${STEP_META.length}`}>
        <div
          className="stepper-progress-fill"
          style={{
            // Calculate percentage: current position / (total - 1) * 100
            width: `${(currentStep / (STEP_META.length - 1)) * 100}%`,
          }}
        />
      </div>
    </nav>
  );
};

export default CheckoutStepper;
