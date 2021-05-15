/* 
1. Decide where is order placed in the entire model and then create appropriate routes for it
2. Make sure all responses are made finalized
3. Add comments
4. Decide what finally is gonna be contained in the qr code 
5. Decide if string will be formed in front end or back ends
Notes:- 




*/

const Restaurant = require("../models/restaurant.model");
var bcrypt = require("bcryptjs");
const restaurant = require("../models/restaurant.model");

exports.getAllRestaurants = (req, res) => {
  Restaurant.find()
    .then((restaurants) => {
      if (restaurants) {
        return res.status(200).json(restaurants);
      } else {
        return res.status(404).json("Restaurant Not Found");
      }
    })
    .catch((err) => res.status(400).json("Error: " + err));
};

exports.getRestaurantById = (req, res) => {
  Restaurant.findById(req.userId)
    .then((restaurant) => {
      if (restaurant) {
        return res.status(200).json(restaurant);
      } else {
        return res.status(404).json("Restaurant Not Found");
      }
    })
    .catch((err) => res.status(400).json("Error: " + err));
};

exports.deleteRestaurantById = (req, res) => {
  Restaurant.findByIdAndDelete(req.userId)
    .then(() => res.status(200).json("Restaurant deleted"))
    .catch((err) => res.status(400).json("Error: " + err));
};

exports.updateRestaurantById = (req, res) => {
  Restaurant.findById(req.userId).then((restaurant) => {
    restaurant.name = req.body.name;
    restaurant.city = req.body.city;
    // restaurant.orders = req.body.orders;
    restaurant.menu = req.body.menu;
    restaurant.tables = req.body.tables;
    restaurant.address = req.body.address;

    restaurant
      .save()
      .then(() => res.status(200).json("Restaurant updated!"))
      .catch((err) => res.status(400).json("Error: " + err));
  });
};

exports.addTable = (req, res) => {
  Restaurant.findById(req.userId).then((restaurant) => {
    var tables = restaurant.tables;
    var new_table = {
      capacity: req.body.capacity,
      tableNumber: req.body.tableNumber,
    };
    tables.push(new_table);

    // restaurant.orders = req.body.orders;

    restaurant.tables = tables;
    restaurant
      .save()
      .then(() => res.status(200).json("Table added"))
      .catch((err) => res.status(400).json("Error: " + err));
  });
};

exports.updateTable = (req, res) => {
  Restaurant.findById(req.userId).then((restaurant) => {
    var tableIndex = restaurant.tables.findIndex(
      (item) => item._id.toString() === req.body._id
    );
    restaurant.tables[tableIndex].capacity = req.body.capacity;
    restaurant.tables[tableIndex].tableNumber = req.body.tableNumber;
    restaurant
      .save()
      .then(() => res.status(200).json("Table updated"))
      .catch((err) => res.status(400).json("Error: " + err));
  });
};

exports.getTables = (req, res) => {
  Restaurant.findById(req.userId)
    .then((restaurant) => {
      if (restaurant) {
        return res.status(200).json(restaurant.tables);
      } else {
        return res.status(404).json("Restaurant Not Found");
      }
    })
    .catch((err) => res.status(400).json("Error: " + err));
};

exports.deleteTable = (req, res) => {
  Restaurant.findById(req.userId)
    .then((restaurant) => {
      restaurant.tables.pull(req.body._id);
      restaurant
        .save()
        .then(() => res.status(200).json("Table Deleted"))
        .catch((err) => res.status(400).json("Error: " + err));
    })
    .catch((err) => res.status(404).json("Error: " + err));
};

exports.addMenu = (req, res) => {
  Restaurant.findById(req.userId).then((restaurant) => {
    var menu = restaurant.menu;
    console.log(menu);
    var menuItemIndex = menu.findIndex(
      (item) => item.name.toString() === req.body.name.toString()
    );
    console.log(menuItemIndex);
    if (menuItemIndex != -1) {
      menu[menuItemIndex].items.push(req.body.item);
    } else {
      var newSection = {
        name: req.body.name,
        items: [req.body.item],
      };
      menu.push(newSection);
    }
    restaurant.menu = menu;
    restaurant
      .save()
      .then(() => res.status(200).json("Menu item added"))
      .catch((err) => res.status(400).json("Error: " + err));
  });
};

exports.updateMenu = (req, res) => {
  Restaurant.findById(req.userId).then((restaurant) => {
    var menuSectionIndex = restaurant.menu.findIndex(
      (item) => item._id.toString() === req.body.sectionId.toString()
    );

    var menuItemIndex = restaurant.menu[menuSectionIndex].items.findIndex(
      (item) => item._id.toString() === req.body.itemId.toString()
    );
    restaurant.menu[menuSectionIndex].items[menuItemIndex].name = req.body.name;
    restaurant.menu[menuSectionIndex].items[menuItemIndex].price =
      req.body.price;

    restaurant
      .save()
      .then(() => res.status(200).json("Menu updated"))
      .catch((err) => res.status(400).json("Error: " + err));
  });
};

exports.deleteMenu = (req, res) => {
  Restaurant.findById(req.userId)
    .then((restaurant) => {
      var menuSectionIndex = restaurant.menu.findIndex(
        (item) => item._id.toString() === req.body.sectionId.toString()
      );
      restaurant.menu[menuSectionIndex].items.pull(req.body.itemId);
      restaurant
        .save()
        .then(() => res.status(200).json("Menu Deleted"))
        .catch((err) => res.status(400).json("Error: " + err));
    })
    .catch((err) => res.status(404).json("Error: " + err));
};
