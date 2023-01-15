

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Roger:lapin01@cluster0.drdrcvg.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const Item1 = new Item({
  name: "Insert Task and check to delete"
});

const defaultItems = [Item1];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);




app.get("/", function (req, res) {


  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Succesfully saved default items to db.")
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

app.get("/:customListName", function (req, res) {
  
  const customListName = _.capitalize(req.params.customListName);


  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) 
    {
      if (!foundList) {
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName)
      } else {
        //Show an existing list
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    }
  });

  
 
});


app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName)
    })
  }






});

app.post("/delete", function (req, res) {
  const checkItemID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkItemID, function (err) {
      if (!err) {
        console.log("Successfully deleted checked item");
      }
  
    })
    res.redirect("/");
  } else{
    List.findOneAndUpdate({name: listName }, {$pull: {items: {_id: checkItemID}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }

    });
  }
  

});



app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(5000, function () {
  console.log("Server started on port 5000");
});
