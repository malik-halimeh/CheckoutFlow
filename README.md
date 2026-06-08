# CheckoutFlow — Secure Multi-Step Checkout

A production-ready, accessible, multi-step frontend checkout application built with **React** and **Bootstrap 5**. The app collects personal information, shipping/billing address, and credit/debit card details through a guided wizard interface with comprehensive validation, keyboard navigation, and screen-reader compatibility.

> **Important:** This is a frontend-only demonstration. No real transactions are processed, no data is sent to any server, and no information persists beyond the current browser session.

---

## Features

- **Multi-step wizard flow** — 8 distinct states: Summary → Personal Info → Address → Payment → Confirmation → Processing → Success / Failure
- **Three-tier validation** — Real-time (on keystroke), on-blur (when leaving a field), and submit-time (before advancing)
- **Automatic card detection** — Identifies Visa, Mastercard, Amex, Discover, and UnionPay from the first few digits
- **Real-time card formatting** — Spaces inserted automatically (4-4-4-4 for most cards, 4-6-5 for Amex)
- **Expiry auto-formatting** — Slash (`/`) inserted automatically between month and year
- **Luhn algorithm validation** — Card numbers are structurally validated without a network round-trip
- **Masked sensitive data** — Card numbers are masked on the confirmation screen (e.g., `**** **** **** 1234`)
- **Success / Failure testing** — Simulated payment alternates between success and failure on each attempt
- **Fully accessible** — Semantic HTML, ARIA attributes, keyboard navigation, focus management, screen-reader announcements
- **Responsive design** — Mobile-first layouts for 320px+, 768px+, and 1200px+ breakpoints
- **Neo-Brutalist aesthetic** — Thick borders, layered shadows, sharp corners, bold typography, high contrast

---

## Technology Stack

| Technology      | Version | Purpose                                    |
| --------------- | ------- | ------------------------------------------ |
| React           | 19.x    | UI library with hooks (functional components only) |
| Bootstrap       | 5.3.x   | Grid, forms, buttons, cards, utilities     |
| Vite            | 8.x     | Build tool and dev server                  |
| Space Grotesk   | —       | Primary typeface (Google Fonts)            |
| JetBrains Mono  | —       | Monospace typeface for card numbers / codes |

No TypeScript, no external backend, no database, no third-party form libraries.

---

## Architecture Overview

The application follows a **container/presentational** architecture:

```
App.jsx (container)
  └── useCheckoutForm.js (custom hook — all state & logic)
       ├── validation.js (pure validation functions)
       └── cardHelpers.js (card formatting & detection)

  └── Step Components (presentational — render only)
       ├── CheckoutStepper.jsx
       ├── CheckoutSummary.jsx
       ├── PersonalInfoForm.jsx
       ├── AddressForm.jsx
       ├── PaymentForm.jsx
       ├── ConfirmationScreen.jsx
       ├── LoadingOverlay.jsx
       ├── SuccessScreen.jsx
       └── FailureScreen.jsx
```

- **App.jsx** consumes the `useCheckoutForm` hook and conditionally renders the correct step component based on a numeric step index.
- **useCheckoutForm.js** owns all form data, errors, step navigation, and payment submission logic. Extracting this into a custom hook keeps every component thin and focused on rendering.
- **validation.js** exports pure functions that accept a value and return `null` (valid) or a human-readable error string. This centralises all validation rules into a single, testable module.
- **cardHelpers.js** handles card number formatting, card type detection, masking, expiry formatting, and reference number generation.

---

## Validation Strategy

Validation occurs at three stages to balance responsiveness with user comfort:

### 1. Real-time (onChange)
Runs on every keystroke — but **only after** the field has been "touched" (i.e., the user has already left and returned to it). This prevents aggressive red errors on the first interaction.

### 2. On-blur (onBlur)
Marks the field as "touched" and validates immediately. This is the primary feedback mechanism — users see errors the moment they move to the next field.

### 3. Submit-time (onSubmit)
Before advancing to the next step, the hook's `nextStep()` function runs the full batch validator for the current step's data. If any errors exist, navigation is blocked and all fields are marked as touched to surface any remaining issues.

### Error display
- Inline beneath each field with a coloured left-border indicator
- `aria-describedby` links each error to its input
- `aria-invalid` marks errored inputs
- `role="alert"` and `aria-live="polite"` ensure screen readers announce errors
- Text prefix (⚠) ensures errors are not communicated by colour alone

---

## Accessibility Decisions

| Feature                      | Implementation                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------ |
| Semantic HTML                | `<form>`, `<fieldset>`, `<legend>`, `<label>`, `<nav>`, `<main>`, `<section>` |
| Label association            | Every `<input>` has a `<label>` with matching `htmlFor` / `id`                |
| Error linkage                | `aria-describedby` on every input, pointing to its error or hint element       |
| Invalid state                | `aria-invalid="true"` when validation fails                                    |
| Required fields              | `aria-required="true"` + native `required` attribute                           |
| Keyboard navigation          | Tab / Shift+Tab / Enter throughout all steps                                   |
| Focus management             | Success and Failure screens programmatically focus their heading on mount       |
| Focus visibility             | 3px solid outline on `:focus-visible` for all interactive elements              |
| Screen reader announcements  | `role="alert"`, `aria-live="assertive"` on result screens                      |
| Card type announcement       | `aria-live="polite"` region announces detected card type as user types          |
| Colour independence          | Text indicators (⚠, ✓) accompany colour-coded states                          |
| Contrast                     | WCAG AA minimum — dark text (#1A1A1A) on light backgrounds (#FFFDF5)           |
| Progress indicator           | `role="progressbar"` with `aria-valuenow` on the stepper track                 |

---

## UX Decisions

### Why a multi-step wizard instead of a single long form?
Multi-step flows reduce cognitive load by presenting one category of information at a time. Users can focus on personal details, then address, then payment — each with its own validation context. Research consistently shows that multi-step forms have higher completion rates than equivalent single-page forms.

### Why a Checkout Summary screen first?
The summary screen sets expectations: users see the three steps ahead of them, understand that their data is secure, and consciously choose to begin. This reduces form abandonment by removing uncertainty about what's coming.

### Why edit buttons on the Confirmation screen?
Allowing users to jump back to any section from the review screen eliminates the frustration of having to click "Back" multiple times. Each edit button navigates directly to the relevant step with data preserved.

### Why alternate success/failure?
Testing both outcomes is essential. The alternating mechanism (odd attempts succeed, even attempts fail) lets QA engineers walk through both flows naturally without any configuration.

---

## Design Decisions

### Neo-Brutalist Style Rationale

The Neo-Brutalist aesthetic was chosen for its premium, high-contrast, modern SaaS appearance. Unlike playful brutalism, this implementation is **professional and restrained**:

- **Thick borders (3–5px):** Create strong visual boundaries between sections, improving scanability
- **Layered offset shadows (4–8px):** Simulate physical depth — cards and buttons feel "lifted" off the surface
- **Sharp corners (0px border-radius):** A deliberate break from the rounded-everything trend, giving the UI a distinctive identity
- **Bold typography (Space Grotesk at 800+ weight):** Uppercase labels and large headings create a strong visual hierarchy
- **High contrast palette:** Near-black (#1A1A1A) on warm off-white (#FFFDF5) with yellow (#FFD60A) and blue (#2D5BFF) accents
- **Micro-animations:** Button hover lifts (translate -2px), active presses (translate +2px), icon pop on result screens, smooth step transitions

### Colour Palette
- **Background:** `#FFFDF5` (warm off-white) — softer than pure white, reduces eye strain
- **Text:** `#1A1A1A` — near-black for maximum readability
- **Primary accent:** `#FFD60A` (warm yellow) — used for the confirm button, step badges, and card-type detection
- **Primary action:** `#2D5BFF` (vibrant blue) — used for navigation buttons and focus rings
- **Success:** `#00C853` — green for completed steps and success state
- **Danger:** `#FF1744` — red for errors and failure state

---

## Testing Notes

### Success / Failure State Toggle

The simulated payment submission uses a **module-level counter** (`submissionAttemptCount`) in `useCheckoutForm.js` that increments on each submission:

- **Odd-numbered attempts → SUCCESS** (1st, 3rd, 5th…)
- **Even-numbered attempts → FAILURE** (2nd, 4th, 6th…)

Each attempt is logged to the browser console with the expected outcome:

```
[CheckoutFlow] Payment attempt #1. This attempt will SUCCEED.
[CheckoutFlow] Payment attempt #2. This attempt will FAIL.
```

The counter persists across form resets within the same session, so using "Start Over" after a success and re-completing the form will produce a failure on the next attempt. Refreshing the page resets the counter.

---

## Folder Structure

```
src/
├── components/                 # React components (one per file)
│   ├── CheckoutStepper.jsx     # Visual progress indicator (steps 0–4)
│   ├── CheckoutSummary.jsx     # Landing screen with overview cards
│   ├── PersonalInfoForm.jsx    # Step 1: name, email, phone
│   ├── AddressForm.jsx         # Step 2: street, city, state, postal, country
│   ├── PaymentForm.jsx         # Step 3: card number, expiry, CVV
│   ├── ConfirmationScreen.jsx  # Step 4: review all data, edit sections
│   ├── LoadingOverlay.jsx      # Processing state with spinner
│   ├── SuccessScreen.jsx       # Payment success with reference number
│   └── FailureScreen.jsx       # Payment failure with retry / edit options
├── hooks/
│   └── useCheckoutForm.js      # Custom hook: all state, navigation, submission
├── utils/
│   ├── validation.js           # Pure validation functions for all fields
│   └── cardHelpers.js          # Card detection, formatting, masking, ref gen
├── styles/
│   └── checkout.css            # Complete Neo-Brutalist design system
├── App.jsx                     # Root component — step orchestration
├── main.jsx                    # React entry point (StrictMode, Bootstrap import)
└── index.html                  # HTML shell with fonts, meta tags, Bootstrap CDN
```

---

## Installation Instructions

### Prerequisites
- **Node.js** 18+ and **npm** 9+ installed

### Setup

```bash
# 1. Clone or navigate to the project directory
cd CheckoutFlow

# 2. Install dependencies
npm install
```

---

## Run Instructions

### Development Server

```bash
npm run dev
```

This starts Vite's development server with Hot Module Replacement (HMR). Open the URL shown in the terminal (typically `http://localhost:5173`).

### Production Build

```bash
npm run build
npm run preview
```

`build` creates an optimised production bundle in `dist/`. `preview` serves it locally for verification.

### Lint

```bash
npm run lint
```

Runs ESLint against the project source files.

---

## Testing the Flow

1. **Start the dev server** (`npm run dev`)
2. Click **"Begin Checkout"** on the summary screen
3. Fill in personal details → Continue
4. Fill in address → Continue
5. Enter a test card number (e.g., `4111 1111 1111 1111`, Visa) with any future expiry and CVV → Review Order
6. Review and click **"Confirm Payment"**
7. First attempt will **succeed** — note the reference number
8. Click **"Start Over"**, complete the flow again
9. Second attempt will **fail** — use "Retry" or "Edit Payment" to test recovery paths

---

## License

This project is a demonstration / educational implementation. No license restrictions apply.
