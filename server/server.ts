import "dotenv/config";
import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    message: "Backend is working!",
  });
});

// Fallback analysis
function getFallbackAnalysis() {
  return {
    instrument: "NIFTY",
    timeframe: "Not specified",
    entryCondition: "Buy after a 1% fall",
    exitCondition: "Not specified",
    holdingPeriod: "Not specified",
    filters: "High-volatility periods",
    researchQuestion:
      "Does buying NIFTY after a 1% fall work better during high-volatility periods?",
    missingInformation: [
      "Specific timeframe (e.g., daily, intraday)",
      "Lookback period/reference point for measuring the 1% fall (e.g., 1-day drop, drop from recent high, intraday from open)",
      "Definition and quantitative threshold for high-volatility periods (e.g., VIX level, ATR, standard deviation)",
      "Exit rules (e.g., stop loss, take profit) or target holding period",
    ],
  };
}

// Analyze trading question
app.post("/api/analyze", async (req, res) => {
  const { question } = req.body;

  console.log("Received question:", question);

  if (!question || !question.trim()) {
    return res.status(400).json({
      message: "Please enter a trading research question.",
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `
Analyze this trading research question:

"${question}"

Extract the following information:

- instrument
- timeframe
- entryCondition
- exitCondition
- holdingPeriod
- filters
- researchQuestion
- missingInformation

Do not make important assumptions.

If information is not provided, mark it as "Not specified".

For missing critical information, include it in missingInformation.

Return only valid JSON.
`,
      config: {
        responseMimeType: "application/json",
      },
    });

    res.json({
      analysis: response.text,
    });
  } catch (error: any) {
    console.error("Gemini error:", error);

    if (error?.status === 429) {
      console.log("Gemini quota exceeded. Using fallback analysis.");

      return res.json({
        analysis: JSON.stringify(getFallbackAnalysis()),
        fallback: true,
      });
    }

    return res.status(500).json({
      message: "Failed to analyze question",
    });
  }
});

// Finalize experiment
app.post("/api/finalize", async (req, res) => {
  const { question, analysis, answers } = req.body;

  console.log("Finalizing experiment...");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `
You are a trading research assistant.

The user originally asked:

"${question}"

The initial analysis was:

${JSON.stringify(analysis, null, 2)}

The user provided answers to the missing information:

${JSON.stringify(answers, null, 2)}

Create a final, clear and testable trading experiment.

Use the user's answers to fill in missing information.

Do not invent important information that the user did not provide.

Return only valid JSON with these fields:

- instrument
- timeframe
- entryCondition
- exitCondition
- holdingPeriod
- filters
- researchQuestion
- performanceMetric

The final experiment should be specific enough that another person could understand exactly what is being tested.
`,
      config: {
        responseMimeType: "application/json",
      },
    });

    res.json({
      experiment: response.text,
    });
  } catch (error: any) {
    console.error("Gemini finalization error:", error);

    if (error?.status === 429) {
      console.log("Gemini quota exceeded. Using fallback experiment.");

      const finalExperiment = {
        instrument: "NIFTY",
        timeframe: answers?.[0] || "Daily",
        entryCondition:
          answers?.[1] ||
          "Buy when NIFTY falls at least 1% from the previous day's closing price",
        exitCondition: answers?.[3] || "Sell after 5 trading days",
        holdingPeriod: "5 trading days",
        filters: answers?.[2] || "India VIX above 20",
        researchQuestion:
          "Does buying NIFTY after a 1% daily fall work better during high-volatility periods?",
        performanceMetric: "Win rate and average return",
      };

      return res.json({
        experiment: JSON.stringify(finalExperiment),
        fallback: true,
      });
    }

    return res.status(500).json({
      message: "Failed to finalize experiment",
    });
  }
});

// Run simulated experiment
app.post("/api/test", async (req, res) => {
  const { experiment } = req.body;

  console.log("Running experiment:", experiment);

  // Simulated results for prototype demonstration.
  // These are NOT real historical market results.
  const results = {
    dataType: "Simulated sample data",
    period: "2021–2025",
    totalTrades: 87,
    winningTrades: 53,
    losingTrades: 34,
    winRate: 60.9,
    averageReturn: 0.72,
    highVolatilityAverageReturn: 1.05,
    normalVolatilityAverageReturn: 0.38,
  };

  res.json({
    results,
  });
});

// Learn from experiment results
app.post("/api/learn", async (req, res) => {
  const { experiment, results } = req.body;

  console.log("Generating experiment insight...");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `
You are a trading research assistant.

Experiment:

${JSON.stringify(experiment, null, 2)}

Results:

${JSON.stringify(results, null, 2)}

Explain the result briefly.

State:
1. What the sample suggests.
2. Whether high-volatility periods performed better.
3. Important limitations.

These are simulated results, so do NOT claim that the strategy is profitable in real markets.

Return only valid JSON with:

- finding
- comparison
- limitations
`,
      config: {
        responseMimeType: "application/json",
      },
    });

    res.json({
      learning: response.text,
    });
  } catch (error: any) {
    console.error("Gemini learning error:", error);

    if (error?.status === 429) {
      const fallbackLearning = {
        finding:
          "The simulated sample shows a positive average return and a win rate above 50%.",
        comparison:
          "High-volatility periods produced a higher average return (1.05%) than normal-volatility periods (0.38%) in this simulated sample.",
        limitations:
          "These are simulated results, not real historical backtest results. Transaction costs, slippage, market regime changes, and sample size would need to be considered before drawing conclusions.",
      };

      return res.json({
        learning: JSON.stringify(fallbackLearning),
        fallback: true,
      });
    }

    return res.status(500).json({
      message: "Failed to generate experiment insight",
    });
  }
});

// Start server
const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});