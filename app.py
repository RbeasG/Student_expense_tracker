from flask import Flask, request, jsonify, render_template
import json

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("expense.html")

# Add income
@app.route("/addIncome", methods=["POST"])
def addIncome():
    income = request.json

    with open("items.json", "r") as file:
        data = json.load(file)

    if data["income"] > 0:
        return jsonify({
            "message": "Income already exists"
        }), 400

    data["income"] = income["amount"]

    with open("items.json", "w") as file:
        json.dump(data, file, indent=4)

    return jsonify({
        "message": "Income added"
    })

# Add expense
@app.route("/addExpense", methods=["POST"])
def addExpense():
    expense = request.json

    with open("items.json", "r") as file:
        data = json.load(file)

    data["expenses"].append(expense)

    with open("items.json", "w") as file:
        json.dump(data, file, indent=4)

    return jsonify({
        "message": "Expense added"
    })

# Balance information
@app.route("/balance")
def balance():
    with open("items.json", "r") as file:
        data = json.load(file)

    total_expenses = 0

    for expense in data["expenses"]:
        total_expenses += expense["amount"]

    remaining = data["income"] - total_expenses

    return jsonify({
        "income": data["income"],
        "expenses": total_expenses,
        "remaining": remaining
    })

# Chart information
@app.route("/chartData")
def chartData():
    with open("items.json", "r") as file:
        data = json.load(file)

    totals = {
        "Needs": 0,
        "Wants": 0,
        "Savings": 0
    }

    details = {
        "Needs": [],
        "Wants": [],
        "Savings": []
    }

    total_expenses = 0

    for expense in data["expenses"]:
        category = expense["category"]
        amount = expense["amount"]

        totals[category] += amount
        total_expenses += amount

        details[category].append({
            "description": expense["description"],
            "amount": amount
        })

    remaining = data["income"] - total_expenses

    totals["Remaining"] = max(remaining, 0)

    return jsonify({
        "totals": totals,
        "details": details
    })

# Send all expenses for breakdown
@app.route("/expenses")
def expenses():
    with open("items.json", "r") as file:
        data = json.load(file)

    return jsonify(data["expenses"])

if __name__ == "__main__":
    app.run(debug=True)



