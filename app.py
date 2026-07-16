from flask import Flask, request, jsonify, render_template
import json

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("expense.html")


@app.route("/addExpense", methods=["POST"])
def addExpense():
    expense = request.json

    with open("items.json", "r") as file:
        expenses = json.load(file)

    expenses.append(expense)

    with open("items.json", "w") as file:
        json.dump(expenses, file, indent=4)

    return jsonify({"message": "Expense added"})


if __name__ == "__main__":
    app.run(debug=True)
