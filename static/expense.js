$(function () {
    $("#tabs").tabs();

    let chart;

    // Function to load/update the pie chart
    function loadChart() {
        fetch("/chartData")
            .then(response => response.json())
            .then(data => {

                const labels = Object.keys(data);
                const values = Object.values(data);

                if (chart) {
                    chart.destroy();
                }

                const ctx = document.getElementById("expenseChart").getContext("2d");

                chart = new Chart(ctx, {
                    type: "pie",
                    data: {
                        labels: labels,
                        datasets: [{
                            data: values
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: "bottom"
                            }
                        }
                    }
                });
            })
            .catch(error => console.error(error));
    }

    // Load the chart when the page opens
    loadChart();

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
            alert(data.message);
            $("#incomeForm")[0].reset();
        })
        .catch(error => {
            console.error("Error:", error);
        });
    });

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
            alert(data.message);
            $("#expenseForm")[0].reset();

            // Update chart after adding an expense
            loadChart();
        })
        .catch(error => {
            console.error("Error:", error);
        });
    });

});