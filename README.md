# AI Trading Research Assistant

A mini AI-powered research assistant that converts natural-language trading questions into structured, testable trading experiments.

This project was built as part of the **AI Full-Stack Developer Intern assignment for AlgoChowk**.

The goal is not to build a complete trading platform. Instead, the prototype focuses on helping a user move from a vague research question to a clearly defined experiment through an AI-assisted workflow.

---

## Overview

Trading research questions are often expressed in natural language and may contain missing or ambiguous information.

For example:

> "Does buying NIFTY after a 1% fall work better during high-volatility periods?"

A system should not blindly assume what "1% fall", "high volatility", or the exit condition means.

The **AI Trading Research Assistant** breaks the question down, identifies missing information, asks the user to clarify it, and then creates a structured trading experiment.

The prototype also includes a simulated testing step and an AI-generated interpretation of the simulated results.

### Core Workflow

**ASK → CLARIFY → DEFINE → TEST → LEARN**

1. **ASK**  
   User enters a natural-language trading research question.

2. **CLARIFY**  
   The system identifies missing or ambiguous information and asks the user to provide it.

3. **DEFINE**  
   The clarified information is converted into a structured trading experiment.

4. **TEST**  
   The experiment is passed to a simulated testing layer.

5. **LEARN**  
   The system summarizes the simulated results and highlights important limitations.

---

## Key Features

### 1. Natural-Language Trading Questions

Users can enter questions in plain English instead of filling out complicated forms.

Example:

```text
Does buying NIFTY after a 1% fall work better during high-volatility periods?
```

---

### 2. AI-Based Question Understanding

The AI extracts important experiment parameters from the user's question:

- Instrument
- Timeframe
- Entry condition
- Exit condition
- Holding period
- Filters
- Research question
- Missing information

---

### 3. Ambiguity Detection

The application does not blindly invent important trading rules.

If important information is missing, it identifies the missing information and asks the user to clarify it.

For example, the original question does not specify:

- What timeframe should be used?
- What does the 1% fall refer to?
- How should high volatility be defined?
- When should the position be exited?

The assistant asks the user to provide these details before defining the final experiment.

---

### 4. Structured Experiment Definition

After clarification, the natural-language question is converted into a structured experiment.

Example:

```json
{
  "instrument": "NIFTY",
  "timeframe": "Daily",
  "entryCondition": "1-day fall from the previous day's closing price",
  "exitCondition": "Sell after 5 trading days",
  "holdingPeriod": "5 trading days",
  "filters": "India VIX above 20",
  "researchQuestion": "Does buying NIFTY after a 1% daily fall work better during high-volatility periods?",
  "performanceMetric": "Win rate and average return"
}
```

---

### 5. Simulated Experiment Testing

The prototype includes a lightweight testing layer using simulated sample data.

This demonstrates how the structured experiment could be passed to a future backtesting engine without requiring a complete trading platform.

The results are clearly labelled as **simulated** and are not presented as real historical market performance.

---

### 6. Result Interpretation

The final step summarizes the simulated experiment results and provides:

- Main finding
- High-volatility vs normal-volatility comparison
- Important limitations

The system explicitly avoids presenting simulated results as evidence of real-world profitability.

---

### 7. AI Quota Fallback

The application includes fallback behavior when the Gemini API is unavailable or the free-tier quota is exceeded.

Instead of crashing, the prototype can continue the demonstration using predefined fallback analysis, experiment definition, and learning output.

This makes the application more robust during evaluation and demo usage.

---

# Product Flow

The application follows a five-stage research workflow.

```text
┌─────────────┐
│     ASK     │
│             │
│ User enters │
│ a question  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  CLARIFY    │
│             │
│ Identify    │
│ missing     │
│ information │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    DEFINE   │
│             │
│ Create a    │
│ structured  │
│ experiment  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    TEST     │
│             │
│ Run a       │
│ simulated   │
│ experiment  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    LEARN    │
│             │
│ Interpret   │
│ the results │
└─────────────┘
```

---

# Example User Journey

### Step 1 — Ask

The user enters:

```text
Does buying NIFTY after a 1% fall work better during high-volatility periods?
```

---

### Step 2 — Clarify

The assistant identifies missing information and asks the user to clarify:

**1. What timeframe should be used?**

```text
Daily
```

**2. What should the 1% fall be measured from?**

```text
A 1% fall from the previous day's closing price
```

**3. How should high volatility be defined?**

```text
India VIX above 20
```

**4. What should the exit or holding period be?**

```text
Sell after 5 trading days
```

---

### Step 3 — Define

The assistant creates the final experiment:

```text
Instrument:
NIFTY

Timeframe:
Daily

Entry Condition:
1-day fall from the previous day's closing price

Exit Condition:
Sell after 5 trading days

Holding Period:
5 trading days

Filter:
India VIX above 20

Research Question:
Does buying NIFTY after a 1% daily fall work better during
high-volatility periods?

Performance Metric:
Win rate and average return
```

---

### Step 4 — Test

The prototype runs the experiment against simulated sample data.

Example simulated output:

```text
Total Trades: 87

Winning Trades: 53

Losing Trades: 34

Win Rate: 60.9%

Average Return: 0.72%

High-Volatility Average Return: 1.05%

Normal-Volatility Average Return: 0.38%
```

---

### Step 5 — Learn

The system summarizes the simulated result:

```text
The simulated sample shows a positive average return and
a win rate above 50%.

High-volatility periods produced a higher average return
than normal-volatility periods in this simulated sample.

However, these are simulated results and should not be
interpreted as evidence that the strategy is profitable
in real markets.
```

---

# Architecture

The application uses a simple frontend-backend architecture.

```text
                    ┌─────────────────────────┐
                    │        User             │
                    │ Natural-language query  │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │     React Frontend      │
                    │                         │
                    │  ASK → CLARIFY → DEFINE │
                    │       TEST → LEARN      │
                    └────────────┬────────────┘
                                 │
                         HTTP REST API
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Express Backend       │
                    │                         │
                    │ /api/analyze            │
                    │ /api/finalize           │
                    │ /api/test               │
                    │ /api/learn              │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │       Gemini API        │
                    │                         │
                    │ Question understanding  │
                    │ Experiment definition   │
                    │ Result interpretation   │
                    └─────────────────────────┘

                         /api/test
                              │
                              ▼
                    ┌─────────────────────────┐
                    │ Simulated Test Layer    │
                    │                         │
                    │ Sample experiment data  │
                    └─────────────────────────┘
```

---

# Architecture Decisions

The project intentionally uses a lightweight architecture because the assignment focuses on a research-assistant prototype rather than a complete production trading system.

### Frontend

The React frontend is responsible for:

- Collecting the user's question
- Displaying the AI analysis
- Displaying clarification questions
- Collecting clarification answers
- Showing the final experiment
- Running the test
- Displaying simulated results
- Displaying the final learning/insight

---

### Backend

The Express backend provides REST endpoints for:

- AI question analysis
- Experiment finalization
- Simulated experiment execution
- Result interpretation

Keeping the Gemini API calls on the backend prevents the API key from being exposed in the frontend.

---

### AI Layer

Google Gemini is used for the parts of the workflow that require natural-language understanding:

```text
User Question
      ↓
Gemini
      ↓
Structured Analysis
      ↓
Missing Information
      ↓
User Clarification
      ↓
Gemini
      ↓
Final Experiment
      ↓
Simulated Results
      ↓
Gemini
      ↓
Research Insight
```

---

# Tech Stack

## Frontend

- React
- TypeScript
- Vite
- CSS

React is used to create the interactive research workflow and manage application state.

TypeScript provides type safety for the experiment, analysis, results, and learning objects.

Vite is used as the frontend development and build tool.

---

## Backend

- Node.js
- Express
- TypeScript
- CORS
- dotenv

Express is used to build the REST API.

TypeScript provides type safety on the backend.

dotenv loads the Gemini API key from environment variables.

CORS allows the frontend development server to communicate with the backend.

---

## AI

- Google Gemini API
- `@google/genai`

Gemini is used for:

1. Understanding the user's natural-language research question.
2. Identifying missing information.
3. Creating the final structured experiment.
4. Interpreting simulated experiment results.

---

## Testing / Research Layer

The prototype currently uses:

- Simulated sample data
- A lightweight experiment execution endpoint

The testing layer is intentionally simple because the assignment does not require building a complete historical backtesting engine.

---

# AI Implementation

The application uses AI for meaningful product functionality rather than using an LLM only as a chatbot.

The AI is responsible for converting an unstructured research question into structured experiment information.

---

## Initial AI Analysis

The `/api/analyze` endpoint sends the user's question to Gemini.

The model is instructed to extract:

```text
instrument
timeframe
entryCondition
exitCondition
holdingPeriod
filters
researchQuestion
missingInformation
```

The model is also instructed:

```text
Do not make important assumptions.

If information is not provided, mark it as "Not specified".

For missing critical information, include it in missingInformation.
```

This helps prevent the system from silently inventing trading rules.

---

## Final Experiment Generation

After the user answers the clarification questions, the frontend sends:

- Original question
- Initial AI analysis
- User answers

to:

```text
POST /api/finalize
```

Gemini then creates the final experiment using the user's answers.

The output contains:

```text
instrument
timeframe
entryCondition
exitCondition
holdingPeriod
filters
researchQuestion
performanceMetric
```

---

## Result Interpretation

After the simulated test is completed, the results are passed to Gemini through:

```text
POST /api/learn
```

The AI generates:

```text
finding
comparison
limitations
```

The prompt explicitly tells the model that the results are simulated and that it must not claim that the strategy is profitable in real markets.

---

# Handling Missing Information

A key product decision was to avoid blindly making important assumptions.

For example, the question:

```text
Does buying NIFTY after a 1% fall work better during high-volatility periods?
```

does not completely define a testable strategy.

Several details are ambiguous:

- What timeframe?
- What is the reference point for the 1% fall?
- What qualifies as high volatility?
- When should the position be exited?

Instead of automatically selecting values, the assistant surfaces these missing details.

This makes the experiment more transparent and gives the user control over the research definition.

---

# Fallback Handling

The Gemini API may become unavailable because of:

- Free-tier request limits
- Temporary API errors
- Service availability
- Network/API failures

The backend therefore includes fallback responses.

When a Gemini quota error occurs, the backend can return predefined structured results instead of returning an unusable server error.

This allows the prototype to continue demonstrating the product flow even when the external AI service is unavailable.

Fallback behavior is implemented for:

```text
/api/analyze
/api/finalize
/api/learn
```

The fallback responses are clearly separated from the normal AI flow in the backend.

---

# Simulated Data Disclaimer

The testing stage currently uses simulated sample data.

Example:

```text
Data Type:
Simulated sample data

Period:
2021–2025

Total Trades:
87

Winning Trades:
53

Losing Trades:
34

Win Rate:
60.9%

Average Return:
0.72%

High-Volatility Average Return:
1.05%

Normal-Volatility Average Return:
0.38%
```

These numbers are used only to demonstrate the product workflow.

They are **not real historical backtest results**.

The application therefore does not claim that the demonstrated strategy is profitable in real markets.

---

# API Endpoints

## `GET /api/health`

Basic backend health check.

### Response

```json
{
  "message": "Backend is working!"
}
```

---

## `POST /api/analyze`

Analyzes the user's natural-language trading research question.

### Request

```json
{
  "question": "Does buying NIFTY after a 1% fall work better during high-volatility periods?"
}
```

### Response

The endpoint returns an AI-generated structured analysis.

Example fields:

```json
{
  "instrument": "NIFTY",
  "timeframe": "Not specified",
  "entryCondition": "Buy after a 1% fall",
  "exitCondition": "Not specified",
  "holdingPeriod": "Not specified",
  "filters": "High-volatility periods",
  "researchQuestion": "Does buying NIFTY after a 1% fall work better during high-volatility periods?",
  "missingInformation": [
    "Specific timeframe",
    "Reference point for measuring the 1% fall",
    "Definition of high volatility",
    "Exit rule or holding period"
  ]
}
```

---

## `POST /api/finalize`

Creates the final structured experiment after the user provides clarification.

### Request

```json
{
  "question": "Original trading research question",
  "analysis": {},
  "answers": [
    "Daily",
    "A 1% fall from the previous day's closing price",
    "India VIX above 20",
    "Sell after 5 trading days"
  ]
}
```

### Response

The endpoint returns a structured experiment containing:

```text
instrument
timeframe
entryCondition
exitCondition
holdingPeriod
filters
researchQuestion
performanceMetric
```

---

## `POST /api/test`

Runs the experiment against simulated sample data.

### Request

```json
{
  "experiment": {}
}
```

### Response

Example:

```json
{
  "results": {
    "dataType": "Simulated sample data",
    "period": "2021–2025",
    "totalTrades": 87,
    "winningTrades": 53,
    "losingTrades": 34,
    "winRate": 60.9,
    "averageReturn": 0.72,
    "highVolatilityAverageReturn": 1.05,
    "normalVolatilityAverageReturn": 0.38
  }
}
```

---

## `POST /api/learn`

Generates a short interpretation of the experiment results.

### Request

```json
{
  "experiment": {},
  "results": {}
}
```

### Response

```json
{
  "learning": {
    "finding": "The simulated sample shows a positive average return and a win rate above 50%.",
    "comparison": "High-volatility periods produced a higher average return than normal-volatility periods in this simulated sample.",
    "limitations": "These are simulated results, not real historical backtest results."
  }
}
```

---

# Key Design Decisions

## 1. Focus on Research Assistance Instead of Trading Execution

The project does not attempt to become a complete trading platform.

There are no:

- Broker integrations
- Live order execution
- Portfolio management systems
- Real-money trading features

The focus is on helping users define and reason about trading experiments.

---

## 2. Clarification Before Experiment Definition

The system asks for missing critical information instead of silently assuming values.

This is important because ambiguous assumptions can significantly change the meaning of a trading experiment.

---

## 3. Structured Output

The AI output is converted into a predictable structure instead of displaying a long conversational response.

This makes the result:

- Easier to understand
- Easier to validate
- Easier to pass to a future backtesting engine
- Easier to extend

---

## 4. Separate AI and Testing Layers

The AI layer understands and defines the experiment.

The testing layer is responsible for producing experiment results.

This separation makes it possible to replace the simulated testing layer with a real backtesting engine later.

---

## 5. Backend AI Integration

The Gemini API is called from the backend rather than directly from the browser.

This prevents exposing the Gemini API key in frontend source code.

---

## 6. Explicit Simulated-Data Labelling

Because the prototype does not use a real historical data provider, the results are clearly labelled as simulated.

This prevents the UI from giving users a misleading impression about the validity of the results.

---

# AI Tools Used

AI-assisted development was used during the implementation process.

### Tools Used

- ChatGPT
- Google Gemini API

### ChatGPT was used for:

- Planning the application architecture
- Breaking the assignment into implementation steps
- Generating and reviewing boilerplate code
- Debugging frontend/backend integration
- Improving the user interface
- Reviewing error handling
- Preparing documentation
- Structuring the README

### Google Gemini API was used inside the application for:

- Natural-language trading question analysis
- Missing-information detection
- Final experiment generation
- Result interpretation

### Developer Decisions

The following aspects were intentionally designed and reviewed rather than blindly generated:

- Product workflow
- ASK → CLARIFY → DEFINE → TEST → LEARN structure
- Separation of frontend, backend, AI, and testing layers
- Ambiguity-handling behavior
- Structured experiment schema
- Simulated-data disclaimer
- API architecture
- Fallback behavior
- User experience
- Scope of the prototype

AI-generated code was reviewed, modified, tested, and integrated into the application during development.

---

# Running the Project Locally

## Prerequisites

Make sure the following are installed:

- Node.js
- npm
- Git

---

## 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Move into the project directory:

```bash
cd AITradingResearchAssistant
```

---

# Frontend Setup

From the project root:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# Backend Setup

Open another terminal.

Move into the server directory:

```bash
cd server
```

Install backend dependencies:

```bash
npm install
```

Create a `.env` file inside the `server` directory.

```env
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend:

```bash
npm run dev
```

The backend will run at:

```text
http://localhost:5000
```

---

# Environment Variables

The application requires a Gemini API key for AI functionality.

Create:

```text
server/.env
```

with:

```env
GEMINI_API_KEY=your_gemini_api_key
```

The actual `.env` file should **never be committed to GitHub**.

A safe repository should contain:

```text
server/.env.example
```

instead of the real `.env`.

Example:

```env
GEMINI_API_KEY=your_gemini_api_key
```

---

# Project Structure

```text
AITradingResearchAssistant/
│
├── public/
│
├── src/
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
│
├── server/
│   ├── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── eslint.config.js
└── README.md
```

> The real `server/.env` file is intentionally not included in the repository.

---

# Current Experiment Example

The prototype uses the following example research question:

```text
Does buying NIFTY after a 1% fall work better during high-volatility periods?
```

After clarification, the experiment becomes:

```text
Instrument:
NIFTY

Timeframe:
Daily

Entry Condition:
1-day fall from the previous day's closing price

Exit Condition:
Sell after 5 trading days

Holding Period:
5 trading days

Filter:
India VIX above 20

Research Question:
Does buying NIFTY after a 1% daily fall work better during
high-volatility periods?

Performance Metric:
Win rate and average return
```

This demonstrates the main product capability: converting a natural-language question into a structured experiment.

---

# Limitations

The current prototype has several limitations.

### 1. Simulated Testing Data

The testing endpoint currently uses predefined simulated results rather than real historical market data.

---

### 2. No Real Backtesting Engine

The project does not currently calculate trades from historical OHLC/VIX data.

---

### 3. No Broker Integration

The application does not connect to a broker and does not execute real trades.

---

### 4. No Persistent Database

The current prototype does not persist user experiments or research history in a database.

---

### 5. Limited Financial Metrics

The current simulated testing layer focuses on basic metrics such as:

- Win rate
- Average return
- High-volatility average return
- Normal-volatility average return

More advanced research metrics are not currently implemented.

---

### 6. Gemini API Dependency

The AI functionality depends on the availability and quota limits of the Gemini API.

Fallback responses are included to keep the prototype functional during API quota limitations.

---

# Future Improvements

If this prototype were developed further, the following improvements could be added.

## 1. Real Historical Market Data

Connect the testing layer to a reliable market-data provider.

This would allow the system to calculate results from actual historical data.

---

## 2. Real Backtesting Engine

The structured experiment could be passed to a dedicated backtesting engine.

For example:

```text
Natural Language Question
          ↓
AI Analysis
          ↓
Structured Experiment
          ↓
Backtesting Engine
          ↓
Historical Results
          ↓
AI Interpretation
```

---

## 3. More Advanced Performance Metrics

Additional metrics could include:

- CAGR
- Maximum drawdown
- Sharpe ratio
- Profit factor
- Average winning trade
- Average losing trade
- Risk/reward ratio
- Number of trades

---

## 4. Interactive Charts

The testing results could be displayed using:

- Equity curves
- Return distributions
- Drawdown charts
- High-volatility vs normal-volatility comparisons

---

## 5. Experiment History

A database could be added to allow users to:

- Save experiments
- Re-run experiments
- Compare experiments
- View previous research

---

## 6. Better Experiment Validation

A validation layer could check whether the final experiment is logically complete before sending it to the testing engine.

For example:

```text
Is instrument specified?
Is timeframe specified?
Is entry condition complete?
Is exit condition complete?
Is holding period defined?
Are required filters available?
```

---

## 7. Real Backtesting Data and Reproducibility

A production version should store:

- Dataset used
- Dataset period
- Strategy definition
- Parameters
- Backtesting engine version
- Results

This would make experiments more reproducible.

---

## 8. Better AI Guardrails

Additional validation could prevent the AI from:

- Inventing unavailable market data
- Making unsupported profitability claims
- Changing user-defined experiment parameters
- Treating simulated results as real results

---

# Why This Architecture Can Be Extended

The current architecture intentionally keeps the experiment definition separate from the testing layer.

The final experiment is structured as data rather than being passed forward as plain conversational text.

For example:

```json
{
  "instrument": "NIFTY",
  "timeframe": "Daily",
  "entryCondition": "1-day fall from the previous day's closing price",
  "exitCondition": "Sell after 5 trading days",
  "holdingPeriod": "5 trading days",
  "filters": "India VIX above 20",
  "researchQuestion": "Does buying NIFTY after a 1% daily fall work better during high-volatility periods?",
  "performanceMetric": "Win rate and average return"
}
```

This means a future version could replace:

```text
Simulated Test Layer
```

with:

```text
Historical Data Provider
        ↓
Backtesting Engine
        ↓
Performance Analysis
```

without needing to redesign the entire frontend workflow.

---

# Scope of the Prototype

The project intentionally focuses on the core assignment requirement:

> Convert a natural-language trading question into a structured, testable experiment while handling ambiguity.

The additional **TEST → LEARN** stages demonstrate how the structured experiment could be used in a future research system.

The prototype does not attempt to implement:

- Real trading
- Broker integration
- Portfolio management
- Live market execution
- Production-grade financial infrastructure

---

# Security Considerations

The Gemini API key is stored in an environment variable on the backend.

The API key is not placed in frontend source code.

The following file should remain local:

```text
server/.env
```

Only the example configuration should be committed:

```text
server/.env.example
```

The `.gitignore` file should also prevent `.env` from being committed.

---

# Disclaimer

This project is an educational software prototype created for an internship assignment.

The simulated experiment results shown by the application are **not real historical backtest results and should not be interpreted as financial advice, investment advice, or evidence of future performance**.

The application does not execute real trades.

Any future production version would require reliable market data, rigorous backtesting, validation, risk controls, and appropriate financial/legal review.

---

# Author

**Shalabha M.**

Computer Science / Engineering Graduate

GitHub: https://github.com/Shalabha1234

LinkedIn: https://www.linkedin.com/in/shalabha-m-aa43ba373/

---

# Assignment

Built for the **AI Full-Stack Developer Intern** assignment at **AlgoChowk**.

The project demonstrates:

- Full-stack development
- React and TypeScript
- REST API development
- Gemini API integration
- Natural-language processing
- Ambiguity handling
- Structured experiment generation
- Simulated research testing
- AI-assisted result interpretation
- Error and quota fallback handling
- Product-oriented UX design