/**
 * useCheckoutForm.js
 *
 * Custom React hook that owns all checkout state, step navigation logic,
 * and payment submission simulation. Extracting this into a hook keeps
 * every form component thin and focused solely on rendering.
 *
 * React Concept – Custom Hooks:
 *   A custom hook is simply a JavaScript function whose name starts with
 *   "use" and that calls other React hooks internally. They let you extract
 *   stateful logic so it can be shared across components without changing
 *   the component hierarchy (no render-props or HOC boilerplate needed).
 */

import { useState, useCallback } from "react";
import {
  validatePersonalInfo,
  validateAddress,
  validatePayment,
} from "../utils/validation";
import { detectCardType, generateReferenceNumber } from "../utils/cardHelpers";

// ---------------------------------------------------------------------------
// Step Constants
// Numeric constants keep step comparisons readable and allow the stepper
// component to render progress bars without coupling to strings.
// ---------------------------------------------------------------------------
export const STEPS = {
  SUMMARY: 0,
  PERSONAL: 1,
  ADDRESS: 2,
  PAYMENT: 3,
  CONFIRMATION: 4,
  PROCESSING: 5,
  SUCCESS: 6,
  FAILURE: 7,
};

// ---------------------------------------------------------------------------
// Initial State
// Defining initial values in one place makes "reset / start over"
// trivially easy – just call setFormData(INITIAL_FORM_DATA).
// ---------------------------------------------------------------------------
const INITIAL_PERSONAL = { fullName: "", email: "", phone: "" };
const INITIAL_ADDRESS = {
  street: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};
const INITIAL_PAYMENT = {
  cardholderName: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
};

// ---------------------------------------------------------------------------
// Success / Failure Toggle
// ---------------------------------------------------------------------------
/**
 * TESTING MECHANISM:
 * The simulated payment alternates between success and failure on each
 * submission attempt. A module-level counter is used so it persists across
 * React re-renders while still resetting when the page is refreshed.
 *
 * Odd-numbered attempts → SUCCESS
 * Even-numbered attempts → FAILURE
 *
 * This deterministic pattern lets QA engineers walk through both flows
 * without any config. The counter is logged to the console so it remains
 * transparent during development.
 */
let submissionAttemptCount = 0;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useCheckoutForm
 *
 * Provides all state and actions needed by the checkout UI.
 *
 * @returns {{
 *   step: number,
 *   formData: Object,
 *   errors: Object,
 *   referenceNumber: string,
 *   cardType: Object|null,
 *   updatePersonal: Function,
 *   updateAddress: Function,
 *   updatePayment: Function,
 *   goToStep: Function,
 *   nextStep: Function,
 *   prevStep: Function,
 *   submitPayment: Function,
 *   resetForm: Function,
 * }}
 */
const useCheckoutForm = () => {
  // -------------------------------------------------------------------------
  // React Concept – useState:
  // useState returns a stateful value and a setter. When the setter is
  // called React schedules a re-render, ensuring the UI is always in sync
  // with the latest data.
  // -------------------------------------------------------------------------

  /** Current step index from the STEPS enum */
  const [step, setStep] = useState(STEPS.SUMMARY);

  /**
   * All collected form data, grouped by section.
   * A nested object (rather than flat keys) makes it easy to spread-update
   * a single section without touching others.
   */
  const [formData, setFormData] = useState({
    personal: { ...INITIAL_PERSONAL },
    address: { ...INITIAL_ADDRESS },
    payment: { ...INITIAL_PAYMENT },
  });

  /**
   * Field-level validation errors.
   * Shape mirrors formData sections: { personal: {}, address: {}, payment: {} }
   * An empty object for a section means no errors in that section.
   */
  const [errors, setErrors] = useState({ personal: {}, address: {}, payment: {} });

  /**
   * Reference number generated on successful payment.
   * Stored in state so the Success screen can read it without prop drilling.
   */
  const [referenceNumber, setReferenceNumber] = useState("");

  /**
   * Detected card network (Visa, Mastercard, Amex, etc.).
   * Derived from the card number as the user types; stored in state so that
   * PaymentForm and useCheckoutForm share the same value without recalculating.
   */
  const [cardType, setCardType] = useState(null);

  // -------------------------------------------------------------------------
  // Field updaters
  // useCallback memoises the function reference. Components that receive
  // these as props won't re-render unless the hook itself re-renders, which
  // prevents unnecessary child renders in deeply nested forms.
  // -------------------------------------------------------------------------

  /**
   * Updates one or more personal info fields.
   * @param {Object} patch – partial personal info object
   */
  const updatePersonal = useCallback((patch) => {
    setFormData((prev) => ({
      ...prev,
      personal: { ...prev.personal, ...patch },
    }));
  }, []);

  /**
   * Updates one or more address fields.
   * @param {Object} patch
   */
  const updateAddress = useCallback((patch) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, ...patch },
    }));
  }, []);

  /**
   * Updates one or more payment fields.
   * Also re-detects the card type when the card number changes.
   *
   * @param {Object} patch
   */
  const updatePayment = useCallback((patch) => {
    setFormData((prev) => {
      const updated = { ...prev.payment, ...patch };
      // Re-detect card type whenever cardNumber changes
      if ("cardNumber" in patch) {
        const digits = patch.cardNumber.replace(/\s/g, "");
        setCardType(detectCardType(digits));
      }
      return { ...prev, payment: updated };
    });
  }, []);

  // -------------------------------------------------------------------------
  // Navigation helpers
  // -------------------------------------------------------------------------

  /**
   * Navigates directly to a specific step.
   * Used by the Confirmation screen's "Edit" buttons.
   *
   * @param {number} targetStep
   */
  const goToStep = useCallback((targetStep) => {
    setStep(targetStep);
    // Scroll to the top on step change so users aren't stranded mid-page
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /**
   * Advances to the next step after validating the current step's data.
   * Populates the errors object if validation fails, preventing navigation.
   */
  const nextStep = useCallback(() => {
    let stepErrors = {};

    if (step === STEPS.PERSONAL) {
      stepErrors = validatePersonalInfo(formData.personal);
      setErrors((prev) => ({ ...prev, personal: stepErrors }));
    } else if (step === STEPS.ADDRESS) {
      stepErrors = validateAddress(formData.address);
      setErrors((prev) => ({ ...prev, address: stepErrors }));
    } else if (step === STEPS.PAYMENT) {
      const isAmex = cardType?.name === "amex";
      stepErrors = validatePayment(formData.payment, isAmex);
      setErrors((prev) => ({ ...prev, payment: stepErrors }));
    }

    // Only advance when there are no errors
    if (Object.keys(stepErrors).length === 0) {
      goToStep(step + 1);
    }
  }, [step, formData, cardType, goToStep]);

  /**
   * Goes back one step.
   * Does not validate – users should be free to correct information.
   */
  const prevStep = useCallback(() => {
    goToStep(Math.max(STEPS.SUMMARY, step - 1));
  }, [step, goToStep]);

  // -------------------------------------------------------------------------
  // Payment Submission
  // -------------------------------------------------------------------------

  /**
   * Simulates an async payment API call using setTimeout.
   *
   * The alternating success/failure mechanism is implemented here.
   * See the TESTING MECHANISM comment at the top of this file.
   */
  const submitPayment = useCallback(() => {
    submissionAttemptCount += 1;
    console.info(
      `[CheckoutFlow] Payment attempt #${submissionAttemptCount}. ` +
        `This attempt will ${submissionAttemptCount % 2 !== 0 ? "SUCCEED" : "FAIL"}.`
    );

    // Move to processing state immediately to show the loading overlay
    goToStep(STEPS.PROCESSING);

    // Simulate a network request delay of 2.5 seconds
    setTimeout(() => {
      const willSucceed = submissionAttemptCount % 2 !== 0;

      if (willSucceed) {
        // Generate a unique reference number for this successful transaction
        setReferenceNumber(generateReferenceNumber());
        goToStep(STEPS.SUCCESS);
      } else {
        goToStep(STEPS.FAILURE);
      }
    }, 2500);
  }, [goToStep]);

  // -------------------------------------------------------------------------
  // Reset
  // -------------------------------------------------------------------------

  /**
   * Resets the entire form back to its initial state.
   * Called by the "Start Over" button on the Success screen.
   * Note: the submissionAttemptCount is NOT reset – the alternation pattern
   * persists within the session for more realistic QA testing.
   */
  const resetForm = useCallback(() => {
    setFormData({
      personal: { ...INITIAL_PERSONAL },
      address: { ...INITIAL_ADDRESS },
      payment: { ...INITIAL_PAYMENT },
    });
    setErrors({ personal: {}, address: {}, payment: {} });
    setCardType(null);
    setReferenceNumber("");
    goToStep(STEPS.SUMMARY);
  }, [goToStep]);

  // Return everything the UI needs
  return {
    step,
    formData,
    errors,
    referenceNumber,
    cardType,
    updatePersonal,
    updateAddress,
    updatePayment,
    goToStep,
    nextStep,
    prevStep,
    submitPayment,
    resetForm,
    STEPS,
  };
};

export default useCheckoutForm;
