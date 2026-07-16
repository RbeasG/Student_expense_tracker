$(function () {
    $("#tabs").tabs();

    // Add Expense
    $("#expenseForm").submit(function (event) {
        event.preventDefault();

        let expense = {
            category: $("#category").val(),
            amount: Number($("#amount").val())
        };

        fetch("/addExpense", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(expense)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            alert(data.message);
            $("#expenseForm")[0].reset();
        })
        .catch(error => {
            console.error("Error:", error);
        });
    });


    // Add Income
    $("#incomeform").submit(function (event) {
        event.preventDefault();

        let income = {
            amount: Number($("#Income").val())
        };

        fetch("/addIncome", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(income)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            alert(data.message);
            $("#incomeForm")[0].reset();
        })
        .catch(error => {
            console.error("Error:", error);
        });
    });
});