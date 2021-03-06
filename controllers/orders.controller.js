let Order = require("../models/order.model");

exports.getAllOrders = (req, res) => {
  Order.find().then((orders) => {
    if (orders) {
      return res.status(200).json(orders);
    } else {
      return res.status(404).json("Orders Not Found");
    }
  });
};

exports.getOrderById = (req, res) => {
  Order.findById(req.params.id)
    .then((order) => {
      if (order) {
        return res.status(200).json(order);
      } else {
        return res.status(404).json("Order Not Found");
      }
    })
    .catch((err) => res.status(400).json("Error: " + err));
};

exports.getOrderByRestaurantId = (req, res) => {
  Order.find({ restaurantId: req.userId })
    .sort({ createdAt: -1 })
    .then((orders) => {
      if (orders) {
        return res.status(200).json(orders);
      } else {
        return res.status(404).json("No orders found for this restaurant");
      }
    });
};

exports.getOrderByCustomerId = (req, res) => {
  Order.find({ userId: req.userId }).then((orders) => {
    if (orders) {
      return res.status(200).json(orders);
    } else {
      return res.status(404).json("No orders found for this customer");
    }
  });
};

exports.getRecentOrderByCustomerId = (req, res) => {
  Order.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .then((orders) => {
      var recentOrders = orders.filter((order) => order.isPaid === false);
      if (recentOrders) {
        return res.status(200).json(recentOrders);
      } else {
        return res.status(404).json("No recent orders found for this customer");
      }
    });
};
exports.getRecentOrderByRestaurantId = (req, res) => {
  Order.find({ restaurantId: req.userId })
    .sort({ createdAt: -1 })
    .then((orders) => {
      var recentOrders = orders.filter((order) => order.isPaid === false);
      if (recentOrders) {
        return res.status(200).json(recentOrders);
      } else {
        return res
          .status(404)
          .json("No recent orders found for this restaurant");
      }
    });
};

exports.addOrder = (req, res) => {
  const userId = req.userId; //from token
  const restaurantId = req.body.restaurantId; //from body
  const restaurantName = req.body.restaurantName;
  const tableNumber = req.body.tableNumber;

  const isPaid = false;
  var total = 0.0;
  var items = [];
  var orderedItems = req.body.items;
  orderedItems.forEach((order) => {
    total += order.quantity * order.price;
    items.push({
      itemName: order.itemName,
      quantity: order.quantity,
      price: order.price,
      itemId: order.itemId,
      isPrepared: false,
      isPreparing: false,
      isServed: false,
    });
  });

  const newOrder = new Order({
    userId,
    restaurantId,
    restaurantName,
    tableNumber,
    total,
    isPaid,
    items,
  });
  newOrder
    .save()
    .then((order) => {
      res.status(200).json(order._id);
    })
    .catch((err) => res.status(400).json("Error: " + err));
};

exports.updateOrder = (req, res) => {
  //restaurant id from token
  //order id from param
  //item id from body
  //update code from body

  //update codes
  //1 - isPrepared
  //2 - isPreparing
  //3 - isServed

  //step 1 get the order
  Order.findById(req.params.id).then((order) => {
    if (order) {
      //got order
      var items = order.items;
      var found_item_index = items.findIndex(
        (item) => item._id.toString() === req.body._id
      ); //find item index from items array with status to be updated
      console.log(found_item_index);

      if (req.body.update_code === 1) {
        // set isPrepared of this item to true

        order.items[found_item_index].isPreparing = true;
        console.log("Ispreparing ");
      } else if (req.body.update_code === 2) {
        order.items[found_item_index].isPrepared = true;
        order.items[found_item_index].isPreparing = true;
        console.log("Isprepared ");
      } else if (req.body.update_code === 3) {
        order.items[found_item_index].isPrepared = true;
        order.items[found_item_index].isPreparing = true;
        order.items[found_item_index].isServed = true;

        //check all order items to see if all order items are served (isServed === true)
        var flag = true; //if it remains true after looping, all items served
        order.items.forEach((item) => {
          if (item.isServed === false) {
            //if any false encounted, set flag to false; if true then keep going
            flag = false;
          }
        });
        if (flag == true) {
          //flag remained true; order completely served
          order.isPaid = true;
        }
      }

      order
        .save()
        .then(() => res.status(200).json("Order updated!"))
        .catch((err) => res.status(400).json("Error: " + err));
    } else {
      return res.status(404).json("Order Not Found");
    }
  });
};

exports.customerPaidUpdateStatus = (req, res) => {
  Order.findById(req.params.id).then((order) => {
    if (order) {
      order.isPaid = true;
      order
        .save()
        .then(() => res.status(200).json("Order is paid for!"))
        .catch((err) => res.status(400).json("Error: " + err));
    } else {
      return res.status(404).json("Order Not Found");
    }
  });
};

exports.getChartData = (req, res) => {
  Order.find({ restaurantId: req.userId })
    .sort("createdAt")
    .limit(10)
    .then((orders) => {
      var returnedArray = [];
      orders.forEach((order) => {
        returnedArray.push({
          time: order.createdAt,
          amount: order.total,
        });
      });
      if (returnedArray) {
        return res.status(200).json(returnedArray);
      } else {
        return res
          .status(404)
          .json("No recent orders found for this restaurant");
      }
    });
};
