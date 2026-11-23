# FraudShield — Privacy-Preserving Fraud Detection Using Deep Learning in Financial Transactions

FraudShield is a student-project demo application with a dark navy/teal/violet theme. The interface follows the project brief with a login/create-account welcome screen before the dashboard, and combines fraud-risk monitoring with selected AI SecurePay-style payment and security workflows.


## Requirements
- Node.js 18 or newer
- A modern browser

No external npm packages are required.

## Run locally
```bash
npm install
npm start
```
Then open http://localhost:3000.

If port 3000 is already in use, use a different port:
- macOS/Linux: `PORT=3017 npm start`
- Windows PowerShell: `$env:PORT=3017; npm start`
Then open http://localhost:3017.

## Modules
- **Overview:** summary cards, risk-distribution visualization, risk activity and recent records.
- **Transactions:** masked records, search and risk-level filter; export synthetic data as JSON.
- **Check transaction:** input amount, merchant, location, payment method, device status, time and recent transaction velocity; returns demo score and risk signals.
- **Model insights:** describes simplified score bands and demo signals.
- **Privacy center:** toggle identifier masking, training-consent preference and demo retention preference.
- **How it works:** project workflow and explanation of planned preprocessing, SMOTE and privacy safeguards.
- **Welcome / login / create account:** local demo profile flow; creates a local profile and session in browser storage. It is not server authentication and passwords are not stored. A one-click demo entry is available.
- **Send payment (SecurePay-style demo):** enter recipient/payment details, screen the transaction using the demo risk endpoint, and confirm a simulated payment record. No funds move.
- **Alerts & activity:** demo security notices, risk flags, local simulated-payment history and a safety checklist.
- **My account:** profile name/email, demo session status and sign-out.

## Backend endpoints
- `GET /api/state` — synthetic records, risk classifications and summary stats
- `POST /api/score` — validates and scores a transaction using the tiny demo network
- `POST /api/settings` — stores local demo preferences in `data.json`
- `POST /api/reset` — resets sample data and preferences
- `GET /api/export` — returns synthetic transaction data as JSON

## Important limitations
- This is an educational prototype. Do not enter real bank, card, identity or personal information.
- The tiny neural network and synthetic training patterns are not a trained or validated banking fraud model.
- The score and risk labels are illustrative and should not be used for financial decisions.
- Login and create-account are browser-only demonstration flows, not real authentication. They do not protect backend endpoints; the profile/session stored in browser localStorage is not a secure credential store.
- Privacy controls are presentation/demo preferences, not a formal privacy guarantee. No differential privacy is implemented.
- The project brief mentions a large dataset, Label Encoding, StandardScaler, train/test split, SMOTE, DNN training, Flask, Pandas/NumPy/scikit-learn and optional TensorFlow/MySQL. Those are **planned stack/workflow items**, not represented as completed training or production integrations in this demo app.
