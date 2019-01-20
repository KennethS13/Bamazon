//Requires packages for mysql and inquirer
var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection for the mysql database
const connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Username
  user: "root",

  // DB password
  password: "",
  database: "bamazon_DB",
});

// connect to the mysql server and sql database
connection.connect(function(err) {
    if (err) throw err;
    showInventory();
});

//Function to prompt the manager to select from a list of tasks which they can perform
const managerTask = function() {
    inquirer.prompt ([
        {
            name: "manager",
            type: "list",
            message: "Please select an administration task to perform.",
            choices: [
                "View all products",
                "View low inventory",
                "Add stock to inventory",
                "Add new product to inventory"
            ]
        }
    ]).then(function(answer) {
        //Switch statement to perform function of selected task
        switch (answer.manager) {
            case "View all products":
                showInventory();
                console.log("\n------------------------");
                break;
            case "View low inventory":
                showLowStock();
                console.log("\n------------------------");
                break;
            case "Add stock to inventory":
                addInventory();
                console.log("\n------------------------");
                break;
            case "Add new product to inventory":
                addProduct();
                console.log("\n------------------------");
                break;
        }
    });
};

//Function to display all of the items in the Product_Table
const showInventory = function() {
    let query = "SELECT * FROM products";
    connection.query(query, function(err, res) {
      if (err) throw err;
      for (var i = 0; i < res.length; i++) {
      //Log the item_ID, product_name, price, and the stock_quantity of each item in the products_table
      console.log("\nProduct ID: " + res[i].item_id + "\nProduct Name: " + res[i].product_name + "\nPrice: $" + res[i].price + "\nQuantity: " + res[i].stock_quantity);
      console.log("\n------------------------");
      }
      managerTask();
    });
};

//Functin to show all low stock inventory where stock is less than 5 items
const showLowStock = function() {
    let query = "SELECT item_id, product_name, stock_quantity FROM products WHERE stock_quantity < 5";
    connection.query(query, function(err, res) {
        if (err) throw err;
        for ( var i = 0; i < res.length; i++ ) {
            //Log the item_ID, product_name, and the stock_quantity of each item returned from the products_table
            console.log("\nProduct ID: " + res[i].item_id + "\nProduct Name: " + res[i].product_name + "\nQuantity: " + res[i].stock_quantity);
        }
        console.log("\n------------------------");
        //Run Manager again for option to perform additional tasks
        managerTask();
    });
};

//Function for inquirer prompt to make sure only positive integers are input by user
const validateInput = function(value) {
    let number = Number.isInteger(parseFloat(value));
    let sign = Math.sign(value);
    if (number && (sign === 1)) {
      return true;
    } else {
      return "Please enter a valid whole non-zero number!";
    };
};

//Function to allow for adding additional stock_quantity for products in the database using inquirer prompts
const addInventory = function(){
    inquirer.prompt([
        {
            name: "product_ID",
            type: "input",
            message: "Please input a Product ID that you would like to add stock to.",
            validate: validateInput,
            filter: Number
        },
        {
            name: "add_amount",
            type: "input",
            message: "Please enter the amount to add to the inventory.",
            validate: validateInput,
            filter: Number
        }
    ]).then(function(answer) {
        //Query the products_table from the database to match the input by manager
        connection.query("SELECT * FROM products", function(err, res) {
            //variable for product_ID input
            let productIDInput;
            //Loop to find the product_ID that was selected by manager
            for ( var i = 0; i< res.length; i++ ) {
                if (res[i].item_id === parseInt(answer.product_ID)) {
                    productIDInput = res[i];
                }
            }
            //Now update the database products_table stock_quantity row with new amount
            let updateAmount = parseInt(productIDInput.stock_quantity) + parseInt(answer.add_amount);
            console.log("Inventory stock updated to: " + updateAmount);
            connection.query("UPDATE products SET ? WHERE ?", [{
                stock_quantity: updateAmount
            }, {
                item_id: answer.product_ID
            }], function(err, res) {
                if (err) {
                    throw err;
                } else {
                    console.log("\n------------------------");
                    //Run Manager again for option to perform additional tasks
                    managerTask();
                }
            });
        });
    });
};

//function for inquirer prompt to validate only positive numbers for price input
const validatePrice = function(value) {
    let number = (typeof parseFloat(value)) === "number";
    let positive = parseFloat(value) >=0;
    if ( number && positive ) {
        return true;
    } else {
        return "Please enter a positive number for the unit price!"
    }
};

//Function to allow for new products to be added into the products_table within the database using inquirer prompts
const addProduct = function() {
    inquirer.prompt([
        {
            name: "product_name",
            type: "input",
            message: "What's the product name?."
        },
        {
            name: "department_name",
            type: "list",
            message: "Please select the department to add this product to.",
            choices: [
                "Clothing",
                "Automotive",
                "Toys and Games",
                "Electronics",
                "Office Products",
                "Books"
            ]
        },
        {
            name: "price",
            type: "input",
            message: "What is the price per unit for this product?",
            validate: validatePrice
        },
        {
            name: "stock_quantity",
            type: "input",
            message: "What's the current amount of inventory stock for this product?",
            validate: validateInput
        }
    ]).then(function(answer) {
        //Insert the managers inputs
        connection.query("INSERT INTO products SET ?", {
            product_name: answer.product_name,
            department_name: answer.department_name,
            price: answer.price,
            stock_quantity: answer.stock_quantity
        }, function(err, res) {
            if (err) {
                throw err;
            } else {
                console.log("Product has been added sucessfully!");
                console.log("\n------------------------");
                managerTask();
            }
        });
    });
};