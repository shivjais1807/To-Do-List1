//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ =  require("lodash");
const app = express();
let day ;
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {
//   useNewUrlParser: true,

// })
mongoose.connect("mongodb+srv://abc:abc@cluster0.8cenai1.mongodb.net/?retryWrites=true&w=majority", {
  useNewUrlParser: true,

})
const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your to do list!"
})

const item2 = new Item({
  name: "Hit the + button to add a new item"
})

const item3 = new Item({
  name: "Hit this - button to delete an item"
})
const defaultItems = [item1, item2, item3];

const listSchema ={
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);




app.get("/", function (req, res) {

   day = date.getDate();

  Item.find({})
    .then((foundItems) => {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems)
          .then(() => {
            console.log("Successfully saved default items to DB")
          })
          .catch((err) => {
            console.log('err', err);
          })
          res.redirect("/")
      }
      else {
        res.render("list", { listTitle: day, newListItems: foundItems });
      }

    })
    .catch((err) => {
      console.log('err', err);
    })


  // 

});

app.get("/:customListName",function(req,res){
 const customListName = _.capitalize(req.params.customListName);

 List.findOne({name:customListName})
 .then((foundList)=>{
     if(!foundList){
     
      const list = new List({
        name: customListName,
        items: defaultItems
       })
       list.save();
       res.redirect("/" + customListName);
     }
     else
     {
      res.render("list" , {listTitle: foundList.name, newListItems: foundList.items})
     }
 })
 .catch((err)=>{

 })
 

})

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list ;
  const item = new Item({
    name: itemName
  })
if(listName === day){

  item.save();
  res.redirect("/");

}
else
{
   List.findOne({name:listName}) 
   .then((foundList)=>{
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName)
   })
   .catch((err)=>{
         console.log("err",err);
   })
}

  
});

app.post("/delete",function(req,res){
  
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === day)
  {
    Item.findByIdAndRemove(checkedItemId)
    .then(()=>{
         console.log("Successfully Deleted");
         res.redirect("/");
    })
    .catch((err)=>{
  
    })
  }
  else
  {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}})
     .then((foundList)=>{
               res.redirect("/"+listName);
     })
     .catch((err)=>{

     })
  }
 
})

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
