# HealthPulse AI

## Run locally

This project loads `database.json` via `fetch`, so open it through a local HTTP server instead of `file://`.

### Option 1: Python
```bash
cd '/Users/nandanamc/Desktop/project fsd'
python3 -m http.server 8000
```
Then open `http://localhost:8000`.

### Option 2: Node.js
```bash
cd '/Users/nandanamc/Desktop/project fsd'
npx serve .
```
Then open the provided local URL.

## Features added

- Full report creation form with weight, height, and notes
- Per-user report filtering (`All Users`, `My Reports`, or select a specific username)
- CRUD support for reports with update and delete actions
- Chart-driven BMI analytics for the logged-in user
- Responsive dashboard styling
