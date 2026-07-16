$(function () {
    $("#tabs").tabs();

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
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to add expense");
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            $("#expenseForm")[0].reset();
        })
        .catch(error => {
            console.error("Error:", error);
        });
    });
});