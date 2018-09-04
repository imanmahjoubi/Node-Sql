
var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "",
    database: "bamazon_db"
});

var products_list = [];
console.log('WELCOME TO YOUR FAVORITE SHOPPING APP');

function readProducts() {
    console.log('Here all the products we have');
    console.log('********************************************');
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
            for(var i=0; i<res.length; i++){
                console.log("ID: "+res[i].item_id+' || Product name: '+res[i].product_name+' || Category: '+res[i].department_name+' || Price: '+ res[i].price);
            }
        // Log all results of the SELECT statement
        order_select();

    });

}

function order_select() {
    inquirer
        .prompt({
            name: "product",
            type: "input",
            message: "What would like to purchase today? please select an id",
        })
        .then(function(answer) {
           runQte(answer.product)
        });

}

function runQte (product){
    inquirer
        .prompt({
            name: "qte",
            type: "input",
            message: "how many you need?",
        })
        .then(function(answer2) {
            console.log('quantity that user choose '+answer2.qte);
            verify(product, answer2.qte);
        });
};
function verify (item, quantity){
    var new_qte = 0;
    var query = 'SELECT stock_qte, price, product_name FROM products WHERE item_id = "'+item+'"' ;
    connection.query(query, function(err, res) {
        console.log('verifying the quantity ........');
        if (err) throw err;
        if(parseInt(res[0].stock_qte) >= parseInt(quantity)){
            console.log('Thank you for shopping');
            new_qte = parseInt(res[0].stock_qte) - parseInt(quantity);
            console.log('You Total would be '+parseFloat(res[0].price) * parseFloat(quantity) +'$');
            purchaseProduct(item,new_qte, res[0].product_name);
        }else {
            if(parseInt(res[0].stock_qte) === 0){
                console.log('Sorry the product is sold out :( ');

            }else {
                console.log('Sorry we only have '+res[0].stock_qte+ ' left!');


            }

            inquirer
                .prompt([
                    {
                        type: "confirm",
                        message: "You would like to purchase all the items left?",
                        name: "confirm",
                        default: true
                    }
                ]).then(function (response) {
                if (response.confirm) {
                    console.log('You Total would be '+parseFloat(res[0].price) * parseFloat(quantity) +'$');
                    purchaseProduct(item, 0, res[0].product_name);
                } else {
                    connection.end();
                }

            });
        }

    });
}
function purchaseProduct (p , q, name){
    var sql = 'UPDATE products SET stock_qte = "'+q+'" WHERE item_id = "'+p+'"';
    connection.query(sql, function(err, res) {
        if (err) throw err;
        console.log('Thank you for purchasing '+ name + ' with us');
        askAgain();
    });


};
function askAgain (){
    inquirer
        .prompt([
            {
                type: "confirm",
                message: "You would like to continue shopping?",
                name: "confirm",
                default: true
            }
        ]).then(function (response) {
        if (response.confirm) {
            readProducts();
        } else {
            setTimeout(function () {
                console.log("Thank you for shopping with us :') ");
            }, 3000);
            connection.end();
        }

    });
}

readProducts();
