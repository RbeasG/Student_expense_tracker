$(function(){
    $("#tabs").tabs();

    let chart;

    function loadChart(){
        fetch("/chartData")
        .then(response=>response.json())
        .then(data=>{
            const totals=data.totals||data;
            const details=data.details||{};

            const labels=["Needs","Wants","Savings","Remaining"];
            const values=[
                totals.Needs,
                totals.Wants,
                totals.Savings,
                totals.Remaining
            ];

            if(chart){
                chart.destroy();
            }

            const ctx=document.getElementById("expenseChart").getContext("2d");

            chart=new Chart(ctx,{
                type:"pie",
                data:{
                    labels:labels,
                    datasets:[{
                        data:values,
                        backgroundColor:["red","blue","green","grey"]
                    }]
                },
                options:{
                    responsive:true,
                    maintainAspectRatio:false,
                    plugins:{
                        legend:{
                            position:"bottom"
                        },
                        tooltip:{
                            callbacks:{
                                label:function(context){
                                    let text=[];
                                    let category=context.label;

                                    text.push(category+": $"+context.raw);

                                    if(details[category]){
                                        details[category].forEach(item=>{
                                            text.push(item.description+": $"+item.amount);
                                        });
                                    }

                                    return text;
                                }
                            }
                        }
                    }
                }
            });
        });
    }

    function loadBreakdown(){
        fetch("/expenses")
        .then(response=>response.json())
        .then(expenses=>{

            let categories={
                Needs:[],
                Wants:[],
                Savings:[]
            };

            expenses.forEach(expense=>{
                categories[expense.category].push(expense);
            });

            let html="<h3>Expense Breakdown</h3>";

            ["Needs","Wants","Savings"].forEach(category=>{
                if(categories[category].length>0){

                    let total=0;

                    html+="<h4>"+category+"</h4>";

                    categories[category].forEach(expense=>{
                        html+="<p>"+expense.description+": $"+expense.amount+"</p>";
                        total+=expense.amount;
                    });

                    html+="<b>Total "+category+": $"+total+"</b><hr>";
                }
            });

            $("#expenseBreakdown").html(html);
        });
    }

    function loadBalance(){
        fetch("/balance")
        .then(response=>response.json())
        .then(data=>{
            $("#remaining").text("Remaining: $"+data.remaining);
        });
    }

    loadChart();
    loadBreakdown();
    loadBalance();

    $("#incomeform").submit(function(event){
        event.preventDefault();

        let income={
            amount:Number($("#Income").val())
        };

        fetch("/addIncome",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(income)
        })
        .then(response=>response.json().then(data=>{
            if(!response.ok){
                throw data;
            }
            return data;
        }))
        .then(data=>{
            alert(data.message);
            $("#incomeform")[0].reset();
            loadChart();
            loadBalance();
        })
        .catch(error=>{
            alert(error.message);
        });
    });

    $("#expenseform").submit(function(event){
        event.preventDefault();

        let expense={
            category:$("#category").val(),
            description:$("#description").val(),
            amount:Number($("#amount").val())
        };

        fetch("/addExpense",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(expense)
        })
        .then(response=>response.json())
        .then(data=>{
            alert(data.message);
            $("#expenseform")[0].reset();
            loadChart();
            loadBreakdown();
            loadBalance();
        })
        .catch(error=>{
            console.error("Expense error:",error);
        });
    });
});