/**
 * PersonalInfoForm.jsx
 *
 * Step 1 of the checkout: collects the user's full name, email, and phone.
 *
 * Validation approach:
 *  - Real-time: on every keystroke via onChange
 *  - On-blur: when the field loses focus via onBlur
 *  - Submit-time: in useCheckoutForm.nextStep() before advancing
 *
 * Accessibility:
 *  - Each <input> has an associated <label> via htmlFor / id
 *  - Error messages are linked to inputs via aria-describedby
 *  - aria-invalid marks inputs in an error state
 *  - Required fields use the required attribute and are marked with a visual asterisk
 *
 * Bootstrap Concepts:
 *  - .form-group / .mb-4    →  vertical spacing between field groups
 *  - .form-control          →  Bootstrap's styled input component
 *  - .is-invalid            →  Bootstrap class that adds a red border + icon
 *  - .invalid-feedback      →  Bootstrap's styled error message container
 *  - .btn / .btn-primary    →  action button styles
 *  - .d-flex / .gap-3       →  horizontal button layout
 */

import React, { useState, useCallback } from "react";
import {
  validateFullName,
  validateEmail,
  validatePhone,
} from "../utils/validation";

/**
 * PersonalInfoForm
 *
 * Props:
 *  @param {Object}   data         – { fullName, email, phone } from formData.personal
 *  @param {Object}   errors       – field-level errors from the custom hook
 *  @param {Function} onChange     – updatePersonal from useCheckoutForm
 *  @param {Function} onNext       – advances to next step (with validation)
 *  @param {Function} onBack       – returns to previous step
 */
const PersonalInfoForm = ({ data, errors, onChange, onNext, onBack }) => {
  /**
   * React Concept – local touched state:
   * "Touched" tracks which fields the user has interacted with.
   * We only show validation errors for touched fields (or all fields
   * on submit-time validation) to avoid bombarding the user with errors
   * before they've had a chance to fill anything in.
   */
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    phone: false,
  });

  // Local validation runs on every keystroke for real-time feedback
  const [localErrors, setLocalErrors] = useState({});

  /**
   * Validates a single field and updates the local error state.
   * @param {string} field – field name key
   * @param {string} value – current field value
   */
  const validateField = useCallback((field, value) => {
    let error = null;
    if (field === "fullName") error = validateFullName(value);
    if (field === "email") error = validateEmail(value);
    if (field === "phone") error = validatePhone(value);

    setLocalErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  /**
   * Generic change handler:
   * 1. Notifies the parent hook to update formData
   * 2. Runs real-time validation if the field is already touched
   */
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      onChange({ [name]: value });
      // Only validate in real-time if the user has already blurred this field
      if (touched[name]) validateField(name, value);
    },
    [onChange, touched, validateField]
  );

  /**
   * Blur handler:
   * Marks the field as touched and immediately validates it
   * so the user gets feedback as soon as they move away.
   */
  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      validateField(name, value);
    },
    [validateField]
  );

  /**
   * Merge hook-level errors (from submit attempts) with local errors
   * so we don't lose server-side / submit-time messages.
   */
  const allErrors = { ...localErrors, ...errors };

  /**
   * Helper: returns the error message for a field only if it has been
   * touched, ensuring silent pre-interaction fields.
   */
  const getError = (field) => (touched[field] ? allErrors[field] : null);

  // Bootstrap Concept – .form-control.is-invalid adds a red border
  const inputClass = (field) =>
    `form-control ${getError(field) ? "is-invalid" : touched[field] && !getError(field) ? "is-valid" : ""}`;

  return (
    <section aria-labelledby="personal-heading">
      <header className="form-step-header">
        <div className="step-icon-large" aria-hidden="true">👤</div>
        <div>
          <h2 id="personal-heading" className="form-step-title">
            Personal Information
          </h2>
          <p className="form-step-subtitle">
            Tell us a little about yourself so we can reach you if needed.
          </p>
        </div>
      </header>

      {/* Semantic HTML – <form> with noValidate disables browser-native
          bubbles, letting our custom validation messages display instead. */}
      <form
        id="personal-info-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          // Mark all fields as touched on submit so errors appear
          setTouched({ fullName: true, email: true, phone: true });
          onNext();
        }}
        aria-label="Personal information form"
      >
        {/* ---- Full Name ---- */}
        <div className="mb-4">
          <label htmlFor="fullName" className="form-label">
            Full Name <span className="required-star" aria-hidden="true">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            className={inputClass("fullName")}
            value={data.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            autoComplete="name"
            placeholder="e.g. Jordan Smith"
            aria-describedby={getError("fullName") ? "fullName-error" : undefined}
            aria-invalid={getError("fullName") ? "true" : "false"}
            aria-required="true"
          />
          {/* Error message shown inline below the input */}
          {getError("fullName") && (
            <div
              id="fullName-error"
              className="invalid-feedback d-block"
              role="alert"
              aria-live="polite"
            >
              {/* Text prefix means the error isn't communicated by colour alone */}
              ⚠ {getError("fullName")}
            </div>
          )}
          {/* Success indicator */}
          {touched.fullName && !getError("fullName") && (
            <div className="valid-feedback d-block">✓ Looks good!</div>
          )}
        </div>

        {/* ---- Email Address ---- */}
        <div className="mb-4">
          <label htmlFor="email" className="form-label">
            Email Address <span className="required-star" aria-hidden="true">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className={inputClass("email")}
            value={data.email}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            autoComplete="email"
            placeholder="e.g. jordan@example.com"
            aria-describedby={
              getError("email") ? "email-error" : "email-hint"
            }
            aria-invalid={getError("email") ? "true" : "false"}
            aria-required="true"
          />
          <div id="email-hint" className="form-hint">
            We'll only use this to send your confirmation.
          </div>
          {getError("email") && (
            <div
              id="email-error"
              className="invalid-feedback d-block"
              role="alert"
              aria-live="polite"
            >
              ⚠ {getError("email")}
            </div>
          )}
          {touched.email && !getError("email") && (
            <div className="valid-feedback d-block">✓ Valid email address.</div>
          )}
        </div>

        {/* ---- Phone Number ---- */}
        <div className="mb-5">
          <label htmlFor="phone" className="form-label">
            Phone Number <span className="required-star" aria-hidden="true">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className={inputClass("phone")}
            value={data.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            autoComplete="tel"
            placeholder="e.g. +1 (555) 123-4567"
            aria-describedby={
              getError("phone") ? "phone-error" : "phone-hint"
            }
            aria-invalid={getError("phone") ? "true" : "false"}
            aria-required="true"
          />
          <div id="phone-hint" className="form-hint">
            International formats accepted (e.g., +44 7911 123456).
          </div>
          {getError("phone") && (
            <div
              id="phone-error"
              className="invalid-feedback d-block"
              role="alert"
              aria-live="polite"
            >
              ⚠ {getError("phone")}
            </div>
          )}
          {touched.phone && !getError("phone") && (
            <div className="valid-feedback d-block">✓ Valid phone number.</div>
          )}
        </div>

        {/* Navigation buttons
            Bootstrap Concept – d-flex / justify-content-between:
            Places Back on the left and Continue on the right. */}
        <div className="d-flex justify-content-between gap-3 form-actions">
          <button
            type="button"
            className="btn btn-outline-secondary btn-nav"
            onClick={onBack}
            aria-label="Go back to the checkout overview"
          >
            ← Back
          </button>
          {/* type="submit" triggers form's onSubmit which calls onNext */}
          <button
            type="submit"
            className="btn btn-primary btn-nav"
            aria-label="Continue to address information"
          >
            Continue →
          </button>
        </div>
      </form>
    </section>
  );
};

export default PersonalInfoForm;
