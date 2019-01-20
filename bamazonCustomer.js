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

//Function to show all of the items in the Product_Table
const showInventory = function() {
  let query = "SELECT * FROM products";
  connection.query(query, function(err, res) {
    if (err) throw err;
    for (var i = 0; i < res.length; i++) {
    //Log the item_ID, product_name, and the price for the products_table
    console.log("\n------------------------");
    console.log("\nProduct ID: " + res[i].item_id + "\nProduct Name: " + res[i].product_name + "\nPrice: $" + res[i].price);
    }
    customerChoice();
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

//Function to allow customer to choose product_ID from item_id row and to choose an amount to purcahse
const customerChoice = function() {
  inquirer.prompt([
    {
      //Inquirer prompt to get customer product purchase selection
      name: "product_ID",
      type: "input",
      message: "What Product ID are you intersted in purchasing?",
      validate: validateInput,
      filter: Number
    },
    {
      //Inquirer prompt asking customer how many units of that product they'd like to purchase
      name: "purchase_amount",
      type: "input",
      message: "How many units of this product would you like to purchase?",
      validate: validateInput,
      filter: Number
    }
  ]).then(function(answer) {
    //Query the database for the selected item_ID
    let query = "SELECT stock_quantity, price, department_name FROM products WHERE ?";
    connection.query(query, { item_id: answer.product_ID }, function(err, res) {
      if (err) throw err;

      //Variables to store the stock_quantity and price to determine if sufficent quantity exists to display for the customer
      let availableStock = res[0].stock_quantity;
      let unitPrice = res[0].price;

      //Check if the available stock meets the customers purchase_amount choice
      console.log(availableStock);
      console.log(answer.purchase_amount);
      if (availableStock >= answer.purchase_amount) {
        
        //Show coustomer the item bought, quantity bought and the total price for the purchase
        let totalPrice = answer.purchase_amount * unitPrice;
        console.log("\n------------------------");
        console.log("\nThank you for your purchase of " + answer.purchase_amount + " untis of Product ID " + answer.product_ID + "\nThe total cost of your purchase was $" + totalPrice);

        //Update the database for the new quantity of the inventory
        let updateQuantity = availableStock - answer.purchase_amount;
        connection.query("UPDATE products SET ? WHERE ?", [{
          stock_quantity: updateQuantity
        }, {
          item_id: answer.product_ID
        }], function(err, res) {
          if (err) {
            throw err;
          } else {
            //Log the new inventory quantity after customers purchase
            console.log("\n------------------------");
            console.log("\nThe current available amount of stock left for Product ID " + answer.product_ID + " is now " + updateQuantity);
          }
        })
        //Redisplay the quantity of product inventory from entire table
        showInventory();
      }
      else{
        //If the inventory does not meet the customers request then log that there is insufficient quantity
        console.log("\n------------------------");
        console.log("\nI'm sorry but there is insufficient quantity of inventory to process your request. \nPlease shop with us again!");
        console.log("\n------------------------");
        showInventory();
      }
    });
  });
};