const Customer = require("../models/customer.model");
const Restaurant = require("../models/restaurant.model");
var bcrypt = require("bcryptjs");
const firebase = require('../db')
const firestore = firebase.firestore();

// exports.allAccess = (req, res) => {
//   res.status(200).send("Public content");
// };

//will require special permissions
exports.getAllCustomers = (req, res) => {
  Customer.find()
    .then((customer) => res.status(200).json(customer))
    .catch((err) => res.status(400).json("Error: " + err));
};

exports.getCustomerById = (req, res) => {
  Customer.findById(req.userId)
    .then((customer) => {
      console.log(customer);
      if (customer) {
        return res.status(200).json(customer);
      } else {
        return res.status(404).json("Customer Not Found");
      }
    })
    .catch((err) => res.status(400).json("Error: " + err));
};

//will require special permissions
exports.deleteCustomerById = (req, res) => {
  Customer.findByIdAndDelete(req.userId)
    .then(() => res.status(200).json("Customer deleted"))
    .catch((err) => res.status(400).json("Error: " + err));
};

exports.updateCustomerById = (req, res) => {
  Customer.findById(req.userId).then((customer) => {
    customer.name = req.body.name;
    customer.email = req.body.email;
    customer.password = bcrypt.hashSync(req.body.password, 8);
    customer.city = req.body.city == null ? "" : req.body.city;
    customer.phone_number = req.body.phone_number;
    customer.orders = req.body.orders;

    customer
      .save()
      .then(() => res.status(200).json("Customer updated!"))
      .catch((err) => res.status(400).json("Error: " + err));
  });
};

//get restaurant by id
exports.getRestaurantById = (req, res) => {
  Restaurant.findById(req.params.id)
    .then((restaurant) => {
      //get necessary info of restaurant and return
      //main is menu
      const name = restaurant.name;
      const email = restaurant.email;
      const city = restaurant.city;
      const menu = restaurant.menu;
      const address = restaurant.address;

      const returned_restaurant = {
        name,
        email,
        city,
        menu,
        address,
      };
      return res.status(200).json(returned_restaurant);
    })
    .catch((err) => res.status(400).json("Error: " + err));
};

exports.getAllRestaurants = (req, res) => {
  Restaurant.find()
    .then((restaurant) => res.status(200).json(restaurant))
    .catch((err) => res.status(400).json("Error: " + err));
}

exports.getByIngredients = async (req, res) => {
  const list_of_ingredients = req.body.ingredients;
  const fetched_ingredients = []
  var ingredients_present_flag = true
  for (const ingredient of list_of_ingredients) {
    const data = await firestore.collection('ingredients').where('name', '==', ingredient)
    const snapshot = await data.get()
    if (snapshot.empty) {
      ingredients_present_flag = false
    }
    else {
      //extract object
      snapshot.forEach(doc => {
        // const item = new Ingredient(doc.id, doc.data().name, doc.data().recipe_ids)
        const item = {
          id: doc.id,
          name: doc.data().name,
          recipe_ids: doc.data().recipe_ids
        }
        fetched_ingredients.push(item) //set fetched ingredients
      })
    }
  }
  if (ingredients_present_flag == false) {
    res.send('Ingredients not found in database') //if checking ingredients fails
  }
  else {
    // console.log('Fetched ingredients: ');
    // console.log(fetched_ingredients);

    //get all common recipe ids
    var arr = [] //merge all ingredient recipe_id arrays into one
    fetched_ingredients.forEach((ingredient) => {
      arr.push(ingredient['recipe_ids'])
    })
    var intersection_of_recipe_ids = arr.reduce((p, c) => p.filter(e => c.includes(e))) //get intersection
    // console.log(intersection_of_recipe_ids); //array of ids of common recipies


    var recipes_to_return = []
    for (const recipe of intersection_of_recipe_ids) {
      const recipe_data = await firestore.collection('recipes').doc(recipe)
      const data = await recipe_data.get();
      const single_recipe = data.data()
      recipes_to_return.push(single_recipe)
    } //get recipes
    for (const recipe of recipes_to_return) {
      var ingredients_ids_list = recipe['new_ings']

      for (const [index, ingredient_id] of ingredients_ids_list.entries()) {
        const ingredients_data = await firestore.collection('ingredients').doc(ingredient_id);
        const data = await ingredients_data.get();
        const name_of_ingredient = data.data().name;
        ingredients_ids_list[index] = name_of_ingredient
      }

    }//replace ingredients ids with correct names

    res.send(recipes_to_return)
  }
}

// exports.userBoard = (req, res) => {
//   res.status(200).send("User Content");
// };
