import { useEffect, useState } from "react";
import "./App.css";

type Analysis = {
  instrument: string;
  timeframe: string;
  entryCondition: string;
  exitCondition: string;
  holdingPeriod: string;
  filters: string;
  researchQuestion: string;
  missingInformation: string[];
};

type Experiment = {
  instrument: string;
  timeframe: string;
  entryCondition: string;
  exitCondition: string;
  holdingPeriod: string;
  filters: string;
  researchQuestion: string;
  performanceMetric: string;
};

type TestResults = {
  dataType: string;
  period: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  averageReturn: number;
  highVolatilityAverageReturn: number;
  normalVolatilityAverageReturn: number;
};

type Learning = {
  finding: string;
  comparison: string;
  limitations: string;
};

function App() {
  const [question, setQuestion] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [finalExperiment, setFinalExperiment] =
    useState<Experiment | null>(null);

  const [testResults, setTestResults] =
    useState<TestResults | null>(null);

  const [learning, setLearning] =
    useState<Learning | null>(null);

  const [loading, setLoading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [learningLoading, setLearningLoading] = useState(false);

  const [error, setError] = useState("");

  const scrollToSection = (id: string) => {
    setTimeout(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };

  const handleAnalyze = async () => {
    if (!question.trim()) {
      setError(
        "Enter a trading research question before continuing."
      );
      return;
    }

    setError("");
    setLoading(true);

    setAnalysis(null);
    setFinalExperiment(null);
    setTestResults(null);
    setLearning(null);

    try {
      const response = await fetch(
        "http://localhost:5000/api/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: question.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Analysis failed."
        );
      }

      if (!data.analysis) {
        throw new Error(
          "The assistant did not return an analysis."
        );
      }

      const parsedAnalysis: Analysis =
        JSON.parse(data.analysis);

      setAnalysis(parsedAnalysis);

      setAnswers(
        new Array(
          parsedAnalysis.missingInformation.length
        ).fill("")
      );

      scrollToSection("clarify-section");
    } catch (error) {
      console.error("Analysis failed:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while analyzing the question."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (
    index: number,
    value: string
  ) => {
    const updatedAnswers = [...answers];

    updatedAnswers[index] = value;

    setAnswers(updatedAnswers);

    if (error) {
      setError("");
    }
  };

  const handleFinalize = async () => {
    if (!analysis) {
      return;
    }

    const unanswered = analysis.missingInformation.some(
      (_, index) =>
        !answers[index]?.trim()
    );

    if (unanswered) {
      setError(
        "Please answer all clarification questions before defining the experiment."
      );
      return;
    }

    setError("");
    setFinalizing(true);
    setFinalExperiment(null);
    setTestResults(null);
    setLearning(null);

    try {
      const response = await fetch(
        "http://localhost:5000/api/finalize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question,
            analysis,
            answers,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Could not define the experiment."
        );
      }

      if (!data.experiment) {
        throw new Error(
          "The assistant did not return a final experiment."
        );
      }

      const parsedExperiment: Experiment =
        JSON.parse(data.experiment);

      setFinalExperiment(parsedExperiment);

      scrollToSection("define-section");
    } catch (error) {
      console.error(
        "Finalization failed:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while defining the experiment."
      );
    } finally {
      setFinalizing(false);
    }
  };

  const handleRunTest = async () => {
    if (!finalExperiment) {
      return;
    }

    setError("");
    setTesting(true);
    setTestResults(null);
    setLearning(null);

    try {
      const response = await fetch(
        "http://localhost:5000/api/test",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            experiment: finalExperiment,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "The experiment could not be tested."
        );
      }

      if (!data.results) {
        throw new Error(
          "No test results were returned."
        );
      }

      setTestResults(data.results);

      scrollToSection("test-section");
    } catch (error) {
      console.error("Test failed:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while running the test."
      );
    } finally {
      setTesting(false);
    }
  };

  const handleLearn = async () => {
    if (!finalExperiment || !testResults) {
      return;
    }

    setError("");
    setLearningLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/learn",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            experiment: finalExperiment,
            results: testResults,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "The experiment insight could not be generated."
        );
      }

      if (!data.learning) {
        throw new Error(
          "No learning insight was returned."
        );
      }

      const parsedLearning: Learning =
        JSON.parse(data.learning);

      setLearning(parsedLearning);

      scrollToSection("learn-section");
    } catch (error) {
      console.error(
        "Learning failed:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while generating the insight."
      );
    } finally {
      setLearningLoading(false);
    }
  };

  const handleStartNewResearch = () => {
    setQuestion("");
    setAnalysis(null);
    setAnswers([]);
    setFinalExperiment(null);
    setTestResults(null);
    setLearning(null);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const getCurrentStep = () => {
    if (learning) return 5;
    if (testResults) return 4;
    if (finalExperiment) return 3;
    if (analysis) return 2;

    return 1;
  };

  const currentStep = getCurrentStep();

  const steps = [
    "ASK",
    "CLARIFY",
    "DEFINE",
    "TEST",
    "LEARN",
  ];

  useEffect(() => {
    if (error) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [error]);

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="brand-icon">AI</div>

          <div>
            <h1>Trading Research Assistant</h1>

            <p>
              Turn a trading idea into a
              testable experiment.
            </p>
          </div>
        </div>

        <div className="prototype-badge">
          Prototype
        </div>
      </header>

      <main className="container">
        <section className="progress-card">
          <div className="progress-header">
            <span>Research workflow</span>

            <span>
              Step {currentStep} of 5
            </span>
          </div>

          <div className="steps">
            {steps.map((step, index) => {
              const stepNumber = index + 1;

              const completed =
                stepNumber < currentStep;

              const active =
                stepNumber === currentStep;

              return (
                <div
                  className="step-wrapper"
                  key={step}
                >
                  <div
                    className={`step ${
                      completed
                        ? "completed"
                        : ""
                    } ${
                      active ? "active" : ""
                    }`}
                  >
                    <div className="step-number">
                      {completed
                        ? "✓"
                        : stepNumber}
                    </div>

                    <span>{step}</span>
                  </div>

                  {stepNumber < 5 && (
                    <div
                      className={`step-line ${
                        completed
                          ? "completed"
                          : ""
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {error && (
          <div className="error-banner" role="alert">
            <div className="error-icon">!</div>

            <div>
              <strong>
                Something needs your attention
              </strong>

              <p>{error}</p>
            </div>

            <button
              className="error-close"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        <section className="hero-card">
          <div className="hero-label">
            <span className="status-dot" />
            AI-assisted research
          </div>

          <h2>
            What do you want to
            investigate?
          </h2>

          <p className="hero-description">
            Describe your trading idea in
            plain language. The assistant will
            identify the important variables,
            ask for missing details, and turn
            it into a structured experiment.
          </p>

          <label
            htmlFor="research-question"
            className="sr-only"
          >
            Trading research question
          </label>

          <textarea
            id="research-question"
            className="question-input"
            placeholder="Example: Does buying NIFTY after a 1% fall work better during high-volatility periods?"
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);

              if (error) {
                setError("");
              }
            }}
            disabled={loading}
          />

          <div className="input-footer">
            <span>
              {question.length} characters
            </span>

            <button
              className="primary-button"
              onClick={handleAnalyze}
              disabled={
                loading || !question.trim()
              }
            >
              {loading ? (
                <>
                  <span className="button-spinner" />
                  Analyzing...
                </>
              ) : (
                "Analyze question →"
              )}
            </button>
          </div>
        </section>

        {analysis && (
          <section
            className="section-card"
            id="clarify-section"
          >
            <div className="section-heading">
              <div>
                <span className="section-kicker">
                  CLARIFY
                </span>

                <h2>
                  Here's what we
                  understood
                </h2>
              </div>

              <span className="ai-badge">
                AI analysis
              </span>
            </div>

            <div className="experiment-grid">
              <div className="info-card">
                <span>Instrument</span>

                <strong>
                  {analysis.instrument}
                </strong>
              </div>

              <div className="info-card">
                <span>Timeframe</span>

                <strong>
                  {analysis.timeframe}
                </strong>
              </div>

              <div className="info-card wide">
                <span>Entry condition</span>

                <strong>
                  {analysis.entryCondition}
                </strong>
              </div>

              <div className="info-card">
                <span>Exit condition</span>

                <strong>
                  {analysis.exitCondition}
                </strong>
              </div>

              <div className="info-card">
                <span>Holding period</span>

                <strong>
                  {analysis.holdingPeriod}
                </strong>
              </div>

              <div className="info-card wide">
                <span>Filters</span>

                <strong>
                  {analysis.filters}
                </strong>
              </div>
            </div>

            <div className="research-question">
              <span>
                Research question
              </span>

              <p>
                “
                {analysis.researchQuestion}
                ”
              </p>
            </div>

            {analysis.missingInformation
              .length > 0 && (
              <div className="clarification-box">
                <div className="clarification-title">
                  <span className="warning-icon">
                    !
                  </span>

                  <div>
                    <strong>
                      A few details are
                      missing
                    </strong>

                    <p>
                      We won't make important
                      assumptions. Tell us what
                      you want to test.
                    </p>
                  </div>
                </div>

                <div className="questions">
                  {analysis.missingInformation.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        className="question-row"
                        key={index}
                      >
                        <label
                          htmlFor={`answer-${index}`}
                        >
                          {item}
                        </label>

                        <input
                          id={`answer-${index}`}
                          type="text"
                          placeholder="Enter your answer..."
                          value={
                            answers[index] ||
                            ""
                          }
                          onChange={(e) =>
                            handleAnswerChange(
                              index,
                              e.target.value
                            )
                          }
                          disabled={
                            finalizing
                          }
                        />
                      </div>
                    )
                  )}
                </div>

                <button
                  className="primary-button"
                  onClick={
                    handleFinalize
                  }
                  disabled={finalizing}
                >
                  {finalizing ? (
                    <>
                      <span className="button-spinner" />
                      Defining experiment...
                    </>
                  ) : (
                    "Define experiment →"
                  )}
                </button>
              </div>
            )}
          </section>
        )}

        {finalExperiment && (
          <section
            className="section-card final-card"
            id="define-section"
          >
            <div className="section-heading">
              <div>
                <span className="section-kicker">
                  DEFINE
                </span>

                <h2>
                  Your experiment is
                  ready
                </h2>
              </div>

              <span className="ready-badge">
                ✓ Testable
              </span>
            </div>

            <div className="final-experiment">
              <div className="experiment-title">
                <span>
                  Research hypothesis
                </span>

                <h3>
                  {
                    finalExperiment.researchQuestion
                  }
                </h3>
              </div>

              <div className="experiment-details">
                <div>
                  <span>Instrument</span>

                  <strong>
                    {
                      finalExperiment.instrument
                    }
                  </strong>
                </div>

                <div>
                  <span>Timeframe</span>

                  <strong>
                    {
                      finalExperiment.timeframe
                    }
                  </strong>
                </div>

                <div>
                  <span>Entry</span>

                  <strong>
                    {
                      finalExperiment.entryCondition
                    }
                  </strong>
                </div>

                <div>
                  <span>Exit</span>

                  <strong>
                    {
                      finalExperiment.exitCondition
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Holding period
                  </span>

                  <strong>
                    {
                      finalExperiment.holdingPeriod
                    }
                  </strong>
                </div>

                <div>
                  <span>Filter</span>

                  <strong>
                    {
                      finalExperiment.filters
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Performance metric
                  </span>

                  <strong>
                    {
                      finalExperiment.performanceMetric
                    }
                  </strong>
                </div>
              </div>
            </div>

            <button
              className="primary-button test-button"
              onClick={handleRunTest}
              disabled={testing}
            >
              {testing ? (
                <>
                  <span className="button-spinner" />
                  Running experiment...
                </>
              ) : (
                "Run simulated test →"
              )}
            </button>
          </section>
        )}

        {testResults && (
          <section
            className="section-card"
            id="test-section"
          >
            <div className="section-heading">
              <div>
                <span className="section-kicker">
                  TEST
                </span>

                <h2>
                  Experiment results
                </h2>
              </div>
            </div>

            <div className="simulation-warning">
              <span>⚠</span>

              <div>
                <strong>
                  Simulated data
                </strong>

                <p>
                  These results are for
                  prototype demonstration
                  only. They are not real
                  historical market results.
                </p>
              </div>
            </div>

            <div className="results-meta">
              <div>
                <span>Dataset</span>

                <strong>
                  {testResults.dataType}
                </strong>
              </div>

              <div>
                <span>Period</span>

                <strong>
                  {testResults.period}
                </strong>
              </div>
            </div>

            <div className="metrics-grid">
              <div className="metric-card">
                <span>
                  Total trades
                </span>

                <strong>
                  {testResults.totalTrades}
                </strong>
              </div>

              <div className="metric-card">
                <span>Win rate</span>

                <strong>
                  {testResults.winRate}%
                </strong>
              </div>

              <div className="metric-card">
                <span>
                  Average return
                </span>

                <strong>
                  {testResults.averageReturn}%
                </strong>
              </div>

              <div className="metric-card">
                <span>
                  Winning trades
                </span>

                <strong>
                  {testResults.winningTrades}
                </strong>
              </div>

              <div className="metric-card">
                <span>
                  Losing trades
                </span>

                <strong>
                  {testResults.losingTrades}
                </strong>
              </div>
            </div>

            <div className="comparison-card">
              <div>
                <span>
                  High-volatility periods
                </span>

                <strong>
                  {
                    testResults.highVolatilityAverageReturn
                  }
                  %
                </strong>
              </div>

              <div className="comparison-vs">
                vs
              </div>

              <div>
                <span>
                  Normal-volatility periods
                </span>

                <strong>
                  {
                    testResults.normalVolatilityAverageReturn
                  }
                  %
                </strong>
              </div>
            </div>

            <button
              className="secondary-button"
              onClick={handleLearn}
              disabled={learningLoading}
            >
              {learningLoading ? (
                <>
                  <span className="button-spinner dark" />
                  Generating insight...
                </>
              ) : (
                "Explain what this means →"
              )}
            </button>
          </section>
        )}

        {learning && (
          <section
            className="section-card learn-card"
            id="learn-section"
          >
            <div className="section-heading">
              <div>
                <span className="section-kicker">
                  LEARN
                </span>

                <h2>
                  What did we learn?
                </h2>
              </div>

              <span className="ai-badge">
                Research insight
              </span>
            </div>

            <div className="learning-grid">
              <div className="learning-item">
                <span>
                  01 · Finding
                </span>

                <h3>
                  What the sample suggests
                </h3>

                <p>
                  {learning.finding}
                </p>
              </div>

              <div className="learning-item">
                <span>
                  02 · Comparison
                </span>

                <h3>
                  Volatility comparison
                </h3>

                <p>
                  {learning.comparison}
                </p>
              </div>

              <div className="learning-item">
                <span>
                  03 · Limitations
                </span>

                <h3>
                  What we should be
                  careful about
                </h3>

                <p>
                  {learning.limitations}
                </p>
              </div>
            </div>

            <div className="bottom-note">
              This prototype demonstrates
              research workflow, not financial
              advice or a production trading
              system.
            </div>

            <button
              className="restart-button"
              onClick={
                handleStartNewResearch
              }
            >
              Start new research
            </button>
          </section>
        )}

        <footer>
          <span>
            AI Trading Research Assistant
          </span>

          <span>
            Built as a research prototype
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;