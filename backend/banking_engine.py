customers_db = []
import pandas as pd


def get_sample_customers():
    customers = [
        {
            "customer_id": "CUST-1001",
            "name": "Arjun Mehta",
            "age": 34,
            "income": 92000,
            "checking_balance": 8500,
            "savings_balance": 28000,
            "credit_score": 742,
            "loan_balance": 18000,
            "credit_card_balance": 2400,
            "investment_balance": 35000,
            "monthly_spend": 4200,
            "missed_payments": 0,
            "relationship_years": 5
        },
        {
            "customer_id": "CUST-1002",
            "name": "Maya Johnson",
            "age": 41,
            "income": 68000,
            "checking_balance": 2100,
            "savings_balance": 6000,
            "credit_score": 665,
            "loan_balance": 42000,
            "credit_card_balance": 7200,
            "investment_balance": 8000,
            "monthly_spend": 5100,
            "missed_payments": 2,
            "relationship_years": 2
        },
        {
            "customer_id": "CUST-1003",
            "name": "Daniel Carter",
            "age": 29,
            "income": 120000,
            "checking_balance": 12500,
            "savings_balance": 45000,
            "credit_score": 781,
            "loan_balance": 0,
            "credit_card_balance": 1500,
            "investment_balance": 72000,
            "monthly_spend": 3900,
            "missed_payments": 0,
            "relationship_years": 4
        },
        {
            "customer_id": "CUST-1004",
            "name": "Sofia Ramirez",
            "age": 52,
            "income": 84000,
            "checking_balance": 3200,
            "savings_balance": 11000,
            "credit_score": 690,
            "loan_balance": 56000,
            "credit_card_balance": 9800,
            "investment_balance": 12000,
            "monthly_spend": 6200,
            "missed_payments": 1,
            "relationship_years": 7
        },
        {
            "customer_id": "CUST-1005",
            "name": "Ethan Brooks",
            "age": 37,
            "income": 155000,
            "checking_balance": 18000,
            "savings_balance": 76000,
            "credit_score": 812,
            "loan_balance": 12000,
            "credit_card_balance": 900,
            "investment_balance": 145000,
            "monthly_spend": 5800,
            "missed_payments": 0,
            "relationship_years": 8
        }
    ]

    return customers


def calculate_financial_health(customer):
    score = 100

    debt_total = customer["loan_balance"] + customer["credit_card_balance"]
    liquid_total = customer["checking_balance"] + customer["savings_balance"]

    if customer["credit_score"] < 700:
        score -= 18

    if customer["missed_payments"] > 0:
        score -= customer["missed_payments"] * 12

    if debt_total > customer["income"] * 0.5:
        score -= 20

    if customer["monthly_spend"] > customer["income"] / 12 * 0.75:
        score -= 15

    if liquid_total < customer["income"] * 0.1:
        score -= 10

    return max(score, 0)


def assign_risk_level(score):
    if score >= 80:
        return "Low Risk"
    if score >= 60:
        return "Moderate Risk"
    return "High Risk"


def recommend_products(customer, score):
    recommendations = []

    if customer["savings_balance"] < customer["income"] * 0.15:
        recommendations.append("High-yield savings account")

    if customer["investment_balance"] < customer["income"] * 0.5 and score >= 70:
        recommendations.append("Managed investment portfolio")

    if customer["credit_card_balance"] > 5000:
        recommendations.append("Debt consolidation loan")

    if customer["credit_score"] >= 740 and customer["loan_balance"] > 0:
        recommendations.append("Loan refinance review")

    if customer["relationship_years"] >= 3 and score >= 75:
        recommendations.append("Premium banking package")

    if not recommendations:
        recommendations.append("Financial wellness consultation")

    return recommendations


def enrich_customers():
    customers = get_sample_customers()

    enriched = []

    for customer in customers:
        score = calculate_financial_health(customer)
        risk = assign_risk_level(score)
        recommendations = recommend_products(customer, score)

        total_assets = (
            customer["checking_balance"]
            + customer["savings_balance"]
            + customer["investment_balance"]
        )

        total_liabilities = (
            customer["loan_balance"]
            + customer["credit_card_balance"]
        )

        net_worth = total_assets - total_liabilities

        enriched.append({
            **customer,
            "financial_health_score": score,
            "risk_level": risk,
            "recommended_products": recommendations,
            "total_assets": total_assets,
            "total_liabilities": total_liabilities,
            "net_worth": net_worth
        })

    return enriched


def portfolio_summary():
    customers = enrich_customers()

    total_customers = len(customers)
    total_assets = sum(c["total_assets"] for c in customers)
    total_liabilities = sum(c["total_liabilities"] for c in customers)
    avg_health_score = round(sum(c["financial_health_score"] for c in customers) / total_customers, 2)

    high_risk = len([c for c in customers if c["risk_level"] == "High Risk"])
    moderate_risk = len([c for c in customers if c["risk_level"] == "Moderate Risk"])
    low_risk = len([c for c in customers if c["risk_level"] == "Low Risk"])

    return {
        "total_customers": total_customers,
        "total_assets": total_assets,
        "total_liabilities": total_liabilities,
        "average_health_score": avg_health_score,
        "risk_breakdown": {
            "High Risk": high_risk,
            "Moderate Risk": moderate_risk,
            "Low Risk": low_risk
        }
    }


def ask_financial_assistant(question):
    customers = enrich_customers()
    question_lower = question.lower()

    if "high risk" in question_lower or "risky" in question_lower:
        high_risk_customers = [c for c in customers if c["risk_level"] == "High Risk"]

        if not high_risk_customers:
            return {
                "answer": "There are currently no high-risk customers in the portfolio.",
                "context": "Risk analysis was performed using credit score, debt levels, missed payments, spending ratio, and liquidity."
            }

        names = ", ".join([c["name"] for c in high_risk_customers])
        return {
            "answer": f"The high-risk customers are: {names}. These customers should be prioritized for relationship manager review.",
            "context": "High risk is determined using missed payments, credit score, debt exposure, income ratio, and available liquidity."
        }

    if "recommend" in question_lower or "product" in question_lower:
        insights = []

        for customer in customers:
            products = ", ".join(customer["recommended_products"])
            insights.append(f"{customer['name']}: {products}")

        return {
            "answer": "Recommended banking products by customer:\n" + "\n".join(insights),
            "context": "Recommendations are generated using savings balance, investment balance, credit score, debt exposure, and relationship length."
        }

    if "summary" in question_lower or "relationship manager" in question_lower:
        summary = portfolio_summary()

        return {
            "answer": (
                f"The portfolio contains {summary['total_customers']} customers with total assets of "
                f"${summary['total_assets']:,} and total liabilities of ${summary['total_liabilities']:,}. "
                f"The average financial health score is {summary['average_health_score']}."
            ),
            "context": "This summary is generated from customer balances, liabilities, credit profile, and calculated financial health scores."
        }

    if "liabilities" in question_lower or "debt" in question_lower:
        liability_lines = []

        for customer in customers:
            liability_lines.append(
                f"{customer['name']}: ${customer['total_liabilities']:,} total liabilities"
            )

        return {
            "answer": "Customer liability summary:\n" + "\n".join(liability_lines),
            "context": "Liabilities include loan balances and credit card balances."
        }

    return {
        "answer": (
            "I can help summarize customer financial profiles, identify high-risk customers, "
            "recommend banking products, and analyze liabilities. Try asking: "
            "'Generate a relationship manager summary' or 'Which customers are high risk?'"
        ),
        "context": "Assistant responses are generated from sample customer financial profiles in this application."
    }
def add_customer(customer):
    score = calculate_financial_health(customer)
    risk = assign_risk_level(score)
    recommendations = recommend_products(customer, score)

    total_assets = (
        customer["checking_balance"]
        + customer["savings_balance"]
        + customer["investment_balance"]
    )

    total_liabilities = (
        customer["loan_balance"]
        + customer["credit_card_balance"]
    )

    net_worth = total_assets - total_liabilities

    enriched_customer = {
        **customer,
        "financial_health_score": score,
        "risk_level": risk,
        "recommended_products": recommendations,
        "total_assets": total_assets,
        "total_liabilities": total_liabilities,
        "net_worth": net_worth
    }

    customers_db.append(enriched_customer)
    return enriched_customer


def get_manual_customers():
    return customers_db