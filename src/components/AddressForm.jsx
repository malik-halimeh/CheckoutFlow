/**
 * AddressForm.jsx
 *
 * Step 2 of the checkout: collects full shipping/billing address.
 *
 * Fields:
 * - Street Address    (required)
 * - Address Line 2    (optional)
 * - City              (required)
 * - State / Province  (required)
 * - Postal Code       (required, format-validated)
 * - Country           (required, dropdown with type-ahead buffer)
 *
 * Validation mirrors the PersonalInfoForm pattern:
 * real-time → blur → submit-time
 *
 * Bootstrap Concepts:
 * - .row .col-md-6    →  two-column layout on medium+ screens
 * - .form-select      →  Bootstrap-styled <select> element
 * - .form-label       →  bold label above inputs
 * - .is-invalid / .invalid-feedback → error display
 */

import React, { useState, useCallback, useRef } from "react";
import {
  validateRequiredField,
  validatePostalCode,
} from "../utils/validation";

// Comprehensive, alphabetically sorted list of global countries
const COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czechia",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

/**
 * AddressForm
 *
 * Props:
 * @param {Object}   data     – address fields from formData.address
 * @param {Object}   errors   – errors from useCheckoutForm (submit-time)
 * @param {Function} onChange – updateAddress from the hook
 * @param {Function} onNext   – advances to Payment step
 * @param {Function} onBack   – returns to Personal Info step
 */
const AddressForm = ({ data, errors, onChange, onNext, onBack }) => {
  // Tracks which fields have been interacted with
  const [touched, setTouched] = useState({
    street: false,
    city: false,
    state: false,
    postalCode: false,
    country: false,
  });

  const [localErrors, setLocalErrors] = useState({});

  // Refs to manage quick-typing search buffer without triggering continuous re-renders
  const searchBufferRef = useRef("");
  const bufferTimeoutRef = useRef(null);

  /**
   * Field-level validator – maps field names to their validation functions.
   */
  const validateField = useCallback((field, value) => {
    let error = null;
    const labels = {
      street: "Street address",
      city: "City",
      state: "State / Province",
      country: "Country",
    };

    if (field === "postalCode") {
      error = validatePostalCode(value);
    } else if (labels[field]) {
      error = validateRequiredField(value, labels[field]);
    }

    setLocalErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      onChange({ [name]: value });
      if (touched[name]) validateField(name, value);
    },
    [onChange, touched, validateField]
  );

  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      validateField(name, value);
    },
    [validateField]
  );

  /**
   * Intercepts keystrokes on the select menu to implement multi-character type-ahead logic.
   */
  const handleCountryKeyDown = useCallback(
    (e) => {
      // Capture standard alphanumeric keys and spaces, ignoring modifications or command keys
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();

        // Clear ongoing clearing timeout
        if (bufferTimeoutRef.current) {
          clearTimeout(bufferTimeoutRef.current);
        }

        // Accumulate keystroke into search buffer
        searchBufferRef.current += e.key;
        const currentSearch = searchBufferRef.current.toLowerCase();

        // Match first country starting with the accumulated prefix
        const matchedCountry = COUNTRIES.find((country) =>
          country.toLowerCase().startsWith(currentSearch)
        );

        if (matchedCountry) {
          onChange({ country: matchedCountry });
          if (touched.country) validateField("country", matchedCountry);
        }

        // Reset the input buffer after 1000ms of typing inactivity
        bufferTimeoutRef.current = setTimeout(() => {
          searchBufferRef.current = "";
        }, 1000);
      }
    },
    [onChange, touched.country, validateField]
  );

  const allErrors = { ...localErrors, ...errors };
  const getError = (field) => (touched[field] ? allErrors[field] : null);

  const inputClass = (field) =>
    `form-control ${getError(field) ? "is-invalid" : touched[field] && !getError(field) ? "is-valid" : ""}`;

  const selectClass = (field) =>
    `form-select ${getError(field) ? "is-invalid" : touched[field] && !getError(field) ? "is-valid" : ""}`;

  return (
    <section aria-labelledby="address-heading">
      <header className="form-step-header">
        <div className="step-icon-large" aria-hidden="true">📍</div>
        <div>
          <h2 id="address-heading" className="form-step-title">
            Address Information
          </h2>
          <p className="form-step-subtitle">
            Your shipping and billing correspondence address.
          </p>
        </div>
      </header>

      <form
        id="address-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setTouched({
            street: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
          });
          onNext();
        }}
        aria-label="Address information form"
      >
        <fieldset className="mb-2">
          <legend className="fieldset-legend">Shipping / Billing Address</legend>

          {/* Street Address */}
          <div className="mb-4">
            <label htmlFor="street" className="form-label">
              Street Address <span className="required-star" aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              id="street"
              name="street"
              className={inputClass("street")}
              value={data.street}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              autoComplete="address-line1"
              placeholder="123 Main Street"
              aria-describedby={getError("street") ? "street-error" : undefined}
              aria-invalid={getError("street") ? "true" : "false"}
            />
            {getError("street") && (
              <div id="street-error" className="invalid-feedback d-block" role="alert" aria-live="polite">
                ⚠ {getError("street")}
              </div>
            )}
          </div>

          {/* Address Line 2 – optional */}
          <div className="mb-4">
            <label htmlFor="addressLine2" className="form-label">
              Address Line 2{" "}
              <span className="optional-label">(optional)</span>
            </label>
            <input
              type="text"
              id="addressLine2"
              name="addressLine2"
              className="form-control"
              value={data.addressLine2}
              onChange={handleChange}
              autoComplete="address-line2"
              placeholder="Apt, Suite, Unit, etc."
              aria-describedby="addressLine2-hint"
            />
            <div id="addressLine2-hint" className="form-hint">
              Apartment, suite, floor, or building number if applicable.
            </div>
          </div>

          {/* Bootstrap Grid – City and State side-by-side on medium+ screens */}
          <div className="row">
            <div className="col-md-6 mb-4">
              <label htmlFor="city" className="form-label">
                City <span className="required-star" aria-hidden="true">*</span>
              </label>
              <input
                type="text"
                id="city"
                name="city"
                className={inputClass("city")}
                value={data.city}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                autoComplete="address-level2"
                placeholder="New York"
                aria-describedby={getError("city") ? "city-error" : undefined}
                aria-invalid={getError("city") ? "true" : "false"}
              />
              {getError("city") && (
                <div id="city-error" className="invalid-feedback d-block" role="alert" aria-live="polite">
                  ⚠ {getError("city")}
                </div>
              )}
            </div>

            <div className="col-md-6 mb-4">
              <label htmlFor="state" className="form-label">
                State / Province <span className="required-star" aria-hidden="true">*</span>
              </label>
              <input
                type="text"
                id="state"
                name="state"
                className={inputClass("state")}
                value={data.state}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                autoComplete="address-level1"
                placeholder="New York / Ontario"
                aria-describedby={getError("state") ? "state-error" : undefined}
                aria-invalid={getError("state") ? "true" : "false"}
              />
              {getError("state") && (
                <div id="state-error" className="invalid-feedback d-block" role="alert" aria-live="polite">
                  ⚠ {getError("state")}
                </div>
              )}
            </div>
          </div>

          {/* Bootstrap Grid – Postal Code and Country side-by-side */}
          <div className="row">
            <div className="col-md-6 mb-4">
              <label htmlFor="postalCode" className="form-label">
                Postal / ZIP Code <span className="required-star" aria-hidden="true">*</span>
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                className={inputClass("postalCode")}
                value={data.postalCode}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                autoComplete="postal-code"
                placeholder="10001 or SW1A 1AA"
                aria-describedby={getError("postalCode") ? "postalCode-error" : "postalCode-hint"}
                aria-invalid={getError("postalCode") ? "true" : "false"}
              />
              <div id="postalCode-hint" className="form-hint">
                US, UK, CA, and most international codes accepted.
              </div>
              {getError("postalCode") && (
                <div id="postalCode-error" className="invalid-feedback d-block" role="alert" aria-live="polite">
                  ⚠ {getError("postalCode")}
                </div>
              )}
            </div>

            <div className="col-md-6 mb-4">
              <label htmlFor="country" className="form-label">
                Country <span className="required-star" aria-hidden="true">*</span>
              </label>
              <select
                id="country"
                name="country"
                className={selectClass("country")}
                value={data.country}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleCountryKeyDown}
                required
                autoComplete="country-name"
                aria-describedby={getError("country") ? "country-error" : undefined}
                aria-invalid={getError("country") ? "true" : "false"}
              >
                <option value="">Select a country…</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {getError("country") && (
                <div id="country-error" className="invalid-feedback d-block" role="alert" aria-live="polite">
                  ⚠ {getError("country")}
                </div>
              )}
            </div>
          </div>
        </fieldset>

        {/* Navigation */}
        <div className="d-flex justify-content-between gap-3 form-actions">
          <button
            type="button"
            className="btn btn-outline-secondary btn-nav"
            onClick={onBack}
            aria-label="Go back to personal information"
          >
            ← Back
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-nav"
            aria-label="Continue to payment details"
          >
            Continue →
          </button>
        </div>
      </form>
    </section>
  );
};

export default AddressForm;