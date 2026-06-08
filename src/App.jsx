/**
 * App.jsx
 *
 * Root component for the CheckoutFlow application.
 * Orchestrates all checkout steps by consuming the useCheckoutForm custom hook
 * and conditionally rendering the appropriate step component.
 *
 * React Concept – Component Composition:
 *   App.jsx acts as a "container" component. It owns the state (via the
 *   custom hook) and delegates rendering to presentational child components.
 *   Each child receives only the props it needs, keeping them focused and
 *   reusable.
 *
 * React Concept – Conditional Rendering:
 *   Instead of using a router (this is a single-page linear flow), we switch
 *   on the `step` value from our hook and render only the component for the
 *   current step. This is cleaner than mounting/unmounting via routes for a
 *   sequential wizard pattern.
 *
 * Bootstrap Concepts:
 *   - .container  → Bootstrap's responsive fixed-width wrapper
 *   - .row / .col → Bootstrap grid layout for centering content
 *   - Utility classes (mt-*, mb-*, text-center) for spacing and alignment
 *
 * Layout structure:
 *   ┌─────────────────────────────────┐
 *   │         Checkout Header         │
 *   ├─────────────────────────────────┤
 *   │       Stepper (steps 0–4)       │
 *   ├─────────────────────────────────┤
 *   │      Active Step Component      │
 *   ├─────────────────────────────────┤
 *   │         Checkout Footer         │
 *   └─────────────────────────────────┘
 */

import useCheckoutForm, { STEPS } from './hooks/useCheckoutForm';

// Step components
import CheckoutStepper from './components/CheckoutStepper';
import CheckoutSummary from './components/CheckoutSummary';
import PersonalInfoForm from './components/PersonalInfoForm';
import AddressForm from './components/AddressForm';
import PaymentForm from './components/PaymentForm';
import ConfirmationScreen from './components/ConfirmationScreen';
import LoadingOverlay from './components/LoadingOverlay';
import SuccessScreen from './components/SuccessScreen';
import FailureScreen from './components/FailureScreen';

/**
 * App
 *
 * The root component. Initialises the checkout hook and renders the
 * correct step component based on the current step index.
 */
function App() {
  // -------------------------------------------------------------------------
  // React Concept – Custom Hook consumption:
  // useCheckoutForm encapsulates ALL checkout state and logic. Destructuring
  // its return value gives us everything we need to render and control
  // the multi-step flow without any state management in this component.
  // -------------------------------------------------------------------------
  const {
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
  } = useCheckoutForm();

  // -------------------------------------------------------------------------
  // Step renderer
  // React Concept – Conditional rendering via a render function:
  // A switch statement inside a function is a clean way to map a numeric
  // step to the corresponding component. Each case returns the JSX for
  // that step with only the props it requires.
  // -------------------------------------------------------------------------
  const renderStep = () => {
    switch (step) {
      // Step 0: Checkout overview / landing
      case STEPS.SUMMARY:
        return (
          <CheckoutSummary
            onStart={nextStep}
          />
        );

      // Step 1: Personal Information (name, email, phone)
      case STEPS.PERSONAL:
        return (
          <PersonalInfoForm
            data={formData.personal}
            errors={errors.personal}
            onChange={updatePersonal}
            onNext={nextStep}
            onBack={prevStep}
          />
        );

      // Step 2: Address Information (shipping / billing)
      case STEPS.ADDRESS:
        return (
          <AddressForm
            data={formData.address}
            errors={errors.address}
            onChange={updateAddress}
            onNext={nextStep}
            onBack={prevStep}
          />
        );

      // Step 3: Payment Details (card number, expiry, CVV)
      case STEPS.PAYMENT:
        return (
          <PaymentForm
            data={formData.payment}
            errors={errors.payment}
            cardType={cardType}
            onChange={updatePayment}
            onNext={nextStep}
            onBack={prevStep}
          />
        );

      // Step 4: Confirmation / Review screen
      case STEPS.CONFIRMATION:
        return (
          <ConfirmationScreen
            formData={formData}
            cardType={cardType}
            goToStep={goToStep}
            onConfirm={submitPayment}
            onBack={prevStep}
          />
        );

      // Step 5: Processing overlay (loading spinner)
      case STEPS.PROCESSING:
        return <LoadingOverlay />;

      // Step 6: Payment succeeded
      case STEPS.SUCCESS:
        return (
          <SuccessScreen
            referenceNumber={referenceNumber}
            userName={formData.personal.fullName}
            onStartOver={resetForm}
          />
        );

      // Step 7: Payment failed
      case STEPS.FAILURE:
        return (
          <FailureScreen
            onRetry={submitPayment}
            onEditPayment={() => goToStep(STEPS.PAYMENT)}
          />
        );

      // Fallback – should never reach here
      default:
        return null;
    }
  };

  return (
    /**
     * The .checkout-app class sets up the full-viewport centred layout.
     * A subtle gradient background (defined in checkout.css) gives the
     * page a warm, premium feel consistent with the Neo-Brutalist aesthetic.
     *
     * The <main> element wraps the interactive content for semantic HTML –
     * screen readers use this landmark to quickly jump to primary content.
     */
    <div className="checkout-app">
      {/* ----------------------------------------------------------------
          Header / Brand bar
          The header sits outside the main card so it feels like a fixed
          brand element. The thick bottom border is a Neo-Brutalist signature.
          ---------------------------------------------------------------- */}
      <header className="checkout-header" role="banner">
        <h1 className="checkout-brand" aria-label="CheckoutFlow secure checkout">
          <span aria-hidden="true">⚡</span> CheckoutFlow
        </h1>
      </header>

      {/* ----------------------------------------------------------------
          Main checkout container
          This is the primary card that holds the stepper and active step.
          The ::before pseudo-element in CSS adds the accent colour stripe
          at the top of the card (a Neo-Brutalist decorative detail).
          ---------------------------------------------------------------- */}
      <main className="checkout-container" id="checkout-main">
        {/* Stepper: shows progress for steps 0–4, hides on processing/result */}
        <CheckoutStepper currentStep={step} />

        {/* Render the active step component */}
        {renderStep()}
      </main>

      {/* ----------------------------------------------------------------
          Footer
          A minimal footer with security copy and branding. Kept outside
          the card to maintain visual hierarchy.
          ---------------------------------------------------------------- */}
      <footer className="checkout-footer" role="contentinfo">
        <p>
          <span aria-hidden="true">🔒</span>{' '}
          Secure checkout demo — no real transactions processed.
        </p>
        <p>
          Built with React &amp; Bootstrap 5 — Neo-Brutalist Design System
        </p>
      </footer>
    </div>
  );
}

export default App;
