import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid
} from "recharts";

function App() {
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [question, setQuestion] = useState("");
  const [assistantAnswer, setAssistantAnswer] = useState("");
  const [assistantContext, setAssistantContext] = useState("");

  const [form, setForm] = useState({
    customer_id: "",
    name: "",
    age: "",
    income: "",
    checking_balance: "",
    savings_balance: "",
    credit_score: "",
    loan_balance: "",
    credit_card_balance: "",
    investment_balance: "",
    monthly_spend: "",
    missed_payments: "",
    relationship_years: ""
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const customersRes = await axios.get("http://127.0.0.1:8000/customers");
    const summaryRes = await axios.get("http://127.0.0.1:8000/summary");
    setCustomers(customersRes.data.customers);
    setSummary(summaryRes.data);
    setSelectedCustomer(customersRes.data.customers[0] || null);
  };

  const addCustomer = async (e) => {
    e.preventDefault();

    const payload = {};
    Object.entries(form).forEach(([key, value]) => {
      payload[key] = ["customer_id", "name"].includes(key) ? value : Number(value);
    });

    await axios.post("http://127.0.0.1:8000/customers", payload);

    setForm({
      customer_id: "", name: "", age: "", income: "",
      checking_balance: "", savings_balance: "", credit_score: "",
      loan_balance: "", credit_card_balance: "", investment_balance: "",
      monthly_spend: "", missed_payments: "", relationship_years: ""
    });

    loadDashboard();
  };

  const askAssistant = async (e) => {
    e.preventDefault();

    const response = await axios.post("http://127.0.0.1:8000/assistant", {
      question
    });

    setAssistantAnswer(response.data.answer);
    setAssistantContext(response.data.context);
  };

  if (!summary) return <div style={loadingStyle}>Loading FinGenie AI...</div>;

  const riskData = Object.entries(summary.risk_breakdown).map(([name, value]) => ({ name, value }));
  const netWorthData = customers.map((c) => ({ name: c.name.split(" ")[0], netWorth: c.net_worth }));

  return (
    <div style={pageStyle}>
      <aside style={sidebarStyle}>
        <h2>FinGenie AI</h2>
        <p style={mutedText}>Banking Relationship Intelligence</p>
        <div style={navItem}>Dashboard</div>
        <div style={navItem}>Add Customer</div>
        <div style={navItem}>AI Assistant</div>
        <div style={navItem}>Risk Insights</div>
      </aside>

      <main style={mainStyle}>
        <header style={heroStyle}>
          <div>
            <p style={eyebrow}>Banking + GenAI Platform</p>
            <h1>FinGenie AI</h1>
            <p style={heroText}>
              Add banking customers manually, analyze financial health, identify risk,
              and ask GenAI-style relationship management questions.
            </p>
          </div>
          <div style={heroCard}>
            <h3>Relationship Portfolio</h3>
            <p>{summary.total_customers} customers monitored</p>
            <strong>${summary.total_assets.toLocaleString()} total assets</strong>
          </div>
        </header>

        <section style={metricGrid}>
          <Metric title="Total Customers" value={summary.total_customers} />
          <Metric title="Total Assets" value={`$${summary.total_assets.toLocaleString()}`} />
          <Metric title="Total Liabilities" value={`$${summary.total_liabilities.toLocaleString()}`} />
          <Metric title="Avg Health Score" value={summary.average_health_score} />
        </section>

        <section style={panelStyle}>
          <h2>Add Banking Customer</h2>
          <form onSubmit={addCustomer} style={formGrid}>
            {Object.keys(form).map((key) => (
              <input
                key={key}
                style={inputStyle}
                placeholder={key.replaceAll("_", " ")}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required
              />
            ))}
            <button style={primaryButton}>Add Customer & Analyze</button>
          </form>
        </section>

        {customers.length === 0 ? (
          <section style={emptyState}>
            <h2>No Customers Added Yet</h2>
            <p>Add a banking customer above to generate financial health score, risk level, product recommendations, and AI relationship insights.</p>
          </section>
        ) : (
          <>
            <section style={gridTwo}>
              <div style={panelStyle}>
                <h2>Risk Distribution</h2>
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={riskData} dataKey="value" nameKey="name" outerRadius={90} label>
                        {riskData.map((entry, index) => (
                          <Cell key={index} fill={["#dc2626", "#f97316", "#22c55e"][index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={panelStyle}>
                <h2>Customer Net Worth</h2>
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={netWorthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="netWorth" fill="#1d4ed8" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            <section style={gridTwo}>
              <div style={panelStyle}>
                <h2>Customer Profiles</h2>
                {customers.map((c) => (
                  <button
                    key={c.customer_id}
                    style={selectedCustomer?.customer_id === c.customer_id ? activeCustomerButton : customerButton}
                    onClick={() => setSelectedCustomer(c)}
                  >
                    <strong>{c.name}</strong>
                    <span>{c.risk_level}</span>
                  </button>
                ))}
              </div>

              <div style={panelStyle}>
                <h2>Selected Customer Intelligence</h2>
                {selectedCustomer && (
                  <>
                    <h3>{selectedCustomer.name}</h3>
                    <p><strong>Risk:</strong> {selectedCustomer.risk_level}</p>
                    <p><strong>Credit Score:</strong> {selectedCustomer.credit_score}</p>
                    <p><strong>Net Worth:</strong> ${selectedCustomer.net_worth.toLocaleString()}</p>
                    <p><strong>Health Score:</strong> {selectedCustomer.financial_health_score}</p>
                    <h3>Recommended Products</h3>
                    {selectedCustomer.recommended_products.map((p, i) => (
                      <span key={i} style={recommendationBadge}>{p}</span>
                    ))}
                  </>
                )}
              </div>
            </section>
          </>
        )}

        <section style={panelStyle}>
          <h2>Banking AI Assistant</h2>
          <form onSubmit={askAssistant} style={assistantForm}>
            <textarea
              style={textareaStyle}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Example: Which customers are high risk?"
            />
            <button style={primaryButton}>Ask FinGenie</button>
          </form>

          <div style={answerBox}>
            <h3>AI Response</h3>
            <p style={{ whiteSpace: "pre-line" }}>{assistantAnswer || "Ask a banking question to generate insights."}</p>
            <h3>Analysis Context</h3>
            <p>{assistantContext || "Context will appear here."}</p>
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({ title, value }) {
  return <div style={metricCard}><p>{title}</p><h2>{value}</h2></div>;
}

const loadingStyle = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" };
const pageStyle = { minHeight: "100vh", background: "#f8fafc", fontFamily: "Arial, sans-serif", display: "flex", color: "#0f172a" };
const sidebarStyle = { width: "260px", background: "#111827", color: "white", padding: "28px", minHeight: "100vh" };
const mainStyle = { flex: 1, padding: "30px" };
const mutedText = { color: "#94a3b8", lineHeight: "1.5" };
const navItem = { padding: "12px", marginTop: "12px", background: "#1f2937", borderRadius: "10px" };
const heroStyle = { background: "linear-gradient(135deg, #111827, #1d4ed8)", color: "white", padding: "34px", borderRadius: "24px", display: "flex", justifyContent: "space-between", marginBottom: "24px" };
const eyebrow = { textTransform: "uppercase", letterSpacing: "2px", color: "#bfdbfe", fontWeight: "bold" };
const heroText = { maxWidth: "700px", color: "#dbeafe", lineHeight: "1.6" };
const heroCard = { background: "rgba(255,255,255,0.12)", padding: "22px", borderRadius: "18px", minWidth: "260px" };
const metricGrid = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "18px", marginBottom: "24px" };
const metricCard = { background: "white", padding: "22px", borderRadius: "18px", boxShadow: "0 8px 22px rgba(15,23,42,0.08)" };
const panelStyle = { background: "white", padding: "24px", borderRadius: "18px", boxShadow: "0 8px 22px rgba(15,23,42,0.08)", marginBottom: "24px" };
const formGrid = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" };
const inputStyle = { padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" };
const primaryButton = { padding: "12px", borderRadius: "10px", border: "none", background: "#1d4ed8", color: "white", fontWeight: "bold", cursor: "pointer" };
const emptyState = { background: "white", padding: "40px", borderRadius: "18px", textAlign: "center", marginBottom: "24px" };
const gridTwo = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" };
const customerButton = { width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #dbeafe", background: "#f8fafc", display: "flex", justifyContent: "space-between", marginBottom: "10px", cursor: "pointer" };
const activeCustomerButton = { ...customerButton, background: "#dbeafe", border: "1px solid #2563eb" };
const recommendationBadge = { display: "inline-block", margin: "5px", background: "#eff6ff", color: "#1d4ed8", padding: "8px 12px", borderRadius: "999px", fontWeight: "bold" };
const assistantForm = { display: "flex", flexDirection: "column", gap: "12px" };
const textareaStyle = { minHeight: "120px", padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1" };
const answerBox = { background: "#f8fafc", border: "1px solid #e2e8f0", padding: "18px", borderRadius: "16px", marginTop: "18px", lineHeight: "1.6" };

export default App;