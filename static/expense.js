$(function () {

    $("#tabs").tabs();

    let chart;



    // Load chart
    function loadChart() {

        fetch("/chartData")

            .then(response => response.json())

            .then(data => {


                const totals = data.totals;


                const labels = [
                    "Needs",
                    "Wants",
                    "Savings",
                    "Remaining"
                ];


                const values = [
                    totals.Needs,
                    totals.Wants,
                    totals.Savings,
                    totals.Remaining
                ];



                if (chart) {
                    chart.destroy();
                }



                const ctx = document
                    .getElementById("expenseChart")
                    .getContext("2d");



                chart = new Chart(ctx, {

                    type: "pie",


                    data: {

                        labels: labels,


                        datasets: [{

                            data: values,


                            backgroundColor: [
                                "red",
                                "blue",
                                "green",
                                "grey"
                            ]

                        }]

                    },


                    options: {

                        responsive: true,

                        maintainAspectRatio: false,


                        plugins: {


                            legend: {

                                position: "bottom"

                            },


                            tooltip: {


                                callbacks: {


                                    label: function(context) {


                                        let category = context.label;

                                        let amount = context.raw;



                                        let text = category + ": $" + amount + "";



                                        if (
                                            data.details &&
                                            data.details[category]
                                        ) {


                                            data.details[category].forEach(item => {


                                                text += "\n" +
                                                item.description +
                                                ": $" +
                                                item.amount;


                                            });


                                        }


                                        return text;


                                    }


                                }


                            }


                        }


                    }


                });



            })

            .catch(error => console.error("Chart error:", error));

    }







    // Group expenses by category
    function loadBreakdown() {


        fetch("/expenses")


            .then(response => response.json())


            .then(expenses => {


                let grouped = {

                    Needs: [],

                    Wants: [],

                    Savings: []

                };



                expenses.forEach(expense => {


                    grouped[expense.category].push(expense);


                });





                let html = "<h3>Expense Breakdown</h3>";





                for (let category in grouped) {



                    if (grouped[category].length > 0) {



                        html += `<h4>${category}</h4>`;



                        let total = 0;



                        grouped[category].forEach(expense => {



                            html += `

                            <p>
                            ${expense.description}: $${expense.amount}
                            </p>

                            `;



                            total += expense.amount;


                        });




                        html += `

                        <b>Total ${category}: $${total}</b>

                        <hr>

                        `;



                    }


                }





                $("#expenseBreakdown").html(html);



            })


            .catch(error => console.error("Breakdown error:", error));


    }







    // Load remaining balance
    function loadBalance() {


        fetch("/balance")


            .then(response => response.json())


            .then(data => {


                $("#remaining").text(

                    "Remaining: $" + data.remaining

                );


            });



    }







    // Initial loading

    loadChart();

    loadBreakdown();

    loadBalance();








    // Add income

    $("#incomeform").submit(function(event) {


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



            $("#incomeform")[0].reset();



            loadChart();

            loadBalance();



        })



        .catch(error => console.error(error));



    });









    // Add expense

    $("#expenseform").submit(function(event) {


        event.preventDefault();




        let expense = {


            category: $("#category").val(),


            description: $("#description").val(),


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



            $("#expenseform")[0].reset();



            loadChart();

            loadBreakdown();

            loadBalance();



        })



        .catch(error => console.error(error));



    });



});