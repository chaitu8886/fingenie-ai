from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from schemas import QuestionRequest
from banking_engine import (
    add_customer,
    get_manual_customers,
    portfolio_summary,
    ask_financial_assistant
)

app = FastAPI(
    title="FinGenie AI",
    description="Banking Relationship Intelligence Platform API",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "FinGenie AI API is running successfully"}


@app.post("/customers")
def create_customer(customer: dict):
    return add_customer(customer)


@app.get("/customers")
def get_customers():
    return {"customers": get_manual_customers()}


@app.get("/summary")
def get_summary():
    customers = get_manual_customers()

    if len(customers) == 0:
        return {
            "total_customers": 0,
            "total_assets": 0,
            "total_liabilities": 0,
            "average_health_score": 0,
            "risk_breakdown": {
                "High Risk": 0,
                "Moderate Risk": 0,
                "Low Risk": 0
            }
        }

    total_customers = len(customers)
    total_assets = sum(c["total_assets"] for c in customers)
    total_liabilities = sum(c["total_liabilities"] for c in customers)
    avg_health_score = round(
        sum(c["financial_health_score"] for c in customers) / total_customers, 2
    )

    return {
        "total_customers": total_customers,
        "total_assets": total_assets,
        "total_liabilities": total_liabilities,
        "average_health_score": avg_health_score,
        "risk_breakdown": {
            "High Risk": len([c for c in customers if c["risk_level"] == "High Risk"]),
            "Moderate Risk": len([c for c in customers if c["risk_level"] == "Moderate Risk"]),
            "Low Risk": len([c for c in customers if c["risk_level"] == "Low Risk"]),
        }
    }


@app.post("/assistant")
def assistant(request: QuestionRequest):
    result = ask_financial_assistant(request.question)
    return {
        "question": request.question,
        "answer": result["answer"],
        "context": result["context"]
    }