
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
console.log('hellow');

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
   console.log('product chosen '+product);
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
    var query = 'SELECT stock_qte FROM products WHERE item_id = "'+item+'"' ;
    connection.query(query, function(err, res) {
        console.log('verifying qte',res.stock_qte);
        if (err) throw err;
        if(parseInt(res[0].stock_qte) > parseInt(quantity)){
            console.log('Thank you for shopping');
            new_qte = parseInt(res[0].stock_qte) - parseInt(quantity);
            console.log('New quantity',new_qte);
            purchaseProduct(item,new_qte);
        }else {
            console.log('we only have '+res[0].stock_qte+ ' left!');
            inquirer
                .prompt([
                    // Here we create a basic text prompt.
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
                    connection.end();
                }

            });
        }

    });
}
function purchaseProduct (p , q){
    console.log('purchasing...');
    var sql = 'UPDATE products SET stock_qte = "'+q+'" WHERE item_id = "'+p+'"';
    connection.query(sql, function(err, res) {
        if (err) throw err;
        console.log("Thank you for shopping with us :') ");

    });
    inquirer
        .prompt([
            // Here we create a basic text prompt.
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
            connection.end();
        }

    });


            }
readProducts();
