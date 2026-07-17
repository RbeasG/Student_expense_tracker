# Budget Tracker — Technical Documentation

## 1. Overview

The Budget Tracker is a single-page website for logging income and expenses, it categorizes spending into Needs, Wants, and Savings, and visualizes the results with a pie chart and a text breakdown. It uses a Python/Flask backend that puts the input data into a local JSON file, and a frontend that utilizes jQuery, jQuery UI, and Chart.js.

**Architecture:**
- **Backend:** Flask (`app.py`) — serves the page and exposes a small JSON API
- **Data store:** `items.json` — a flat file acting as the "database"
- **Frontend markup:** `expense.html` — a Jinja2 template with a tabbed layout
- **Frontend logic:** `expense.js` — fetches data from the API, renders the chart, and handles form submissions
- **Styling:** `main.css` (layout)

---

## 2. Data Model

All of the data is saved in `items.json`, structured as:

```json
{
  "income": 7000,
  "expenses": [
    { "category": "Needs", "description": "Rent", "amount": 1200 }
  ]
}
```

The  `income` varable is single total income figure. Once set to a value greater than 0, it cannot be changed via the app (see `addIncome` below). 
The `expenses` is an array of objects where each object has `category` (`"Needs"`, `"Wants"`, or `"Savings"`), `description` (string), and `amount` (number).

This file is read and rewritten every time the user inputs new data

---

## 3. Backend (`app.py`)

A Flask app with five routes, all reading/writing `items.json` directly.

### `GET /`
Renders `expense.html`.

### `POST /addIncome`
Adds an income value.
- Reads `items.json`.
- if `data["income"]` is already greater than 0, the request is rejected with a `400` and the message `"Income already exists"` — this variable only ever accepts one income entry, ever. There is no way to update income once set.
- Otherwise sets `data["income"]` to the entered `amount` and saves the file.
- Returns `{"message": "Income added"}` on success.

### `POST /addExpense`
Appends a new expense object (`category`, `description`, `amount`) to `data["expenses"]` and saves the file. Returns `{"message": "Expense added"}`. There is no validation of `category` values or of `amount` being numeric/positive at the backend level — the frontend `<select>` and `type="number"` input are the only safeguards.

### `GET /balance`
Sums every expense's `amount`, subtracts that total from `income`, and returns:
```json
{ "income": 7000, "expenses": 2250, "remaining": 4750 }
```

### `GET /chartData`
Builds the data behind the pie chart:
- `totals`: a dict of `Needs`, `Wants`, `Savings` sums plus a computed `Remaining` (income minus total expenses, floored at 0 via `max(remaining, 0)` — so if expenses exceed income, the chart shows "Remaining: 0" rather than a negative slice).
- `details`: for each category, a list of `{description, amount}` pairs — used later to populate the pie chart's tooltip with a line-item breakdown, not just the category total.

### `GET /expenses`
Returns the raw `data["expenses"]` array, unfiltered — used by the frontend to build the text breakdown in the "View info" tab.

**Note:** `app.run(debug=True)` is set, meaning Flask's debugger and auto-reload are active. This is because we are still in local development only.

---

## 4. Frontend

### 4.1 Page structure (`expense.html`)

The page is a single jQuery UI **tabs** widget (`$("#tabs").tabs()`) with three tabs:

1. **Add Income** (`#tab-1`) — a form (`#incomeform`) with one numeric input.
2. **Add Expense** (`#tab-2`) — a form (`#expenseform`) with a category dropdown (Needs/Wants/Savings), a description text field, and a numeric amount field.
3. **View info** (`#tab-3`) — contains:
   - `#expenseChart`, a `<canvas>` element that Chart.js renders into.
   - `#expenseBreakdown`, a container populated with generated HTML listing every expense grouped by category.
   - `#remaining`, a text line showing the leftover balance.

External libraries loaded via CDN: jQuery 3.7.1, jQuery UI 1.14.1 (styling + `.tabs()` behavior), and Chart.js (latest, unpinned).

### 4.2 Application logic (`expense.js`)

Everything runs inside a single `$(function(){...})` (jQuery's DOM-ready wrapper). Key pieces:

**`loadChart()`**
- Fetches `/chartData`.
- Destroys any existing Chart.js instance before creating a new one (`if (chart) chart.destroy()`) — this prevents duplicate/overlapping charts when data is refreshed after a form submission.
- Renders a **pie chart** with four slices: Needs, Wants, Savings, Remaining, colored red/blue/green/grey respectively.
- Customizes the tooltip callback so that hovering a slice shows the category total *and* every individual expense description/amount within that category (pulled from the `details` object returned by the API).

**`loadBreakdown()`**
- Fetches `/expenses`.
- Groups the raw expense list into `Needs`/`Wants`/`Savings` buckets client-side.
- Builds an HTML string listing each expense (`description: $amount`) under its category heading, followed by a bolded category total, and injects it into `#expenseBreakdown`.

**`loadBalance()`**
- Fetches `/balance` and writes `"Remaining: $<value>"` into `#remaining`.

**Initial load:** all three functions above are called once on page load so the "View info" tab is populated before the user interacts with anything.

**`#incomeform` submit handler**
- Prevents the default form submit.
- POSTs `{amount}` (parsed as a `Number`) to `/addIncome`.
- Because the response body is parsed as JSON regardless of status code, a failed request (e.g. income already set) still resolves — the code explicitly checks `response.ok` and throws the parsed error body so it lands in `.catch()`.
- On success: shows an alert with the server's message, resets the form, and re-runs `loadChart()` and `loadBalance()`.
- On failure: shows an alert with the error message (e.g. "Income already exists").

**`#expenseform` submit handler**
- Prevents the default form submit.
- POSTs `{category, description, amount}` to `/addExpense`.
- Unlike the income handler, this one does **not** check `response.ok` before treating the response as success — any 200-level or error response is parsed as JSON and treated as a success case (an alert with `data.message` is shown either way). A true network failure or JSON parse error is caught and logged to the console instead of alerted to the user.
- On success: resets the form and re-runs `loadChart()`, `loadBreakdown()`, and `loadBalance()` to refresh every view.

### 4.3 Styling

**`main.css`** is the stylesheet actually linked in `expense.html`. It defines:
- `.info-container`: a flex row that lays the chart and breakdown side-by-side.
- `.chart-container`: fixes the chart area to 400×400px.
- `#expenseBreakdown`: fixes width to 300px.
- `#remaining`: centers and enlarges the balance text below the chart.

**`expense.css`** is **not referenced anywhere in `expense.html`** and appears to be a leftover/unused file (credited to "geeksforgeeks.org" in a comment). It defines styling for a conic-gradient donut chart with a center label and a custom legend (browser-market-share themed classes like `.chrome`, `.firefox`) — none of which correspond to any element ID or class actually used in this app. It can likely be deleted, or was retained from an earlier prototype before Chart.js was adopted.

---

## 5. Known Limitations / Things to Be Aware Of

- **Single-user, file-based storage.** `items.json` is read/written on every request with no locking — concurrent requests could race and corrupt data.
- **Income can only be set once.** There's no `/updateIncome` or edit path; if you need to change it, `items.json` must be edited manually (or reset).
- **No server-side input validation.** `category`, `amount`, and `description` are trusted as-is from the client.
- **Negative remaining balance is hidden, not surfaced.** `/chartData` floors `Remaining` at 0, so overspending isn't visually distinguishable from spending exactly all income in the chart (though `/balance`'s `remaining` value is unclamped and would show a true negative).
- **`expense.css` is dead code** — not linked in the HTML, doesn't match any current DOM structure.
- **Debug mode is on** (`app.run(debug=True)`), which should be disabled before any non-local deployment.
