from flask import Flask, request, jsonify, render_template
import json

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("expense.html")

@app.route("/addIncome", methods=["POST"])
def addIncome():
    income = request.json

    with open("items.json", "r") as file:
        data = json.load(file)

    if data["income"] > 0:
        return jsonify({"message": "Income already exists"}), 400

    data["income"] = income["amount"]

    with open("items.json", "w") as file:
        json.dump(data, file, indent=4)

    return jsonify({"message": "Income added"})


@app.route("/addExpense", methods=["POST"])
def addExpense():
    expense = request.json

    with open("items.json", "r") as file:
        data = json.load(file)

    data["expenses"].append(expense)

    with open("items.json", "w") as file:
        json.dump(data, file, indent=4)

    return jsonify({"message": "Expense added"})


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




if __name__ == "__main__":
    app.run(debug=True)
