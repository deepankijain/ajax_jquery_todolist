const express = require("express");
const mongoose = require("mongoose");
const expressSanitizer = require("express-sanitizer");
const methodOverride = require('method-override');

mongoose.connect("mongodb://localhost:27017/todo_app", {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
app.use(expressSanitizer());
app.set("view engine", "ejs");
app.use(methodOverride('_method'));

var todoSchema = new mongoose.Schema({
  text: String,
});

var Todo = mongoose.model("Todo", todoSchema);

app.get("/", function (req, res) {
  res.redirect("/todos");
});

app.get("/todos", function (req, res) {
  Todo.find({}, function (err, todos) {
    if (err) {
      console.log(err);
    } else {
      if (req.xhr) return res.json(todos);
      res.render("index", {
        todos: todos
      });
    }
  })
});

app.post("/todos", function (req, res) {
  req.body.todo.text = req.sanitize(req.body.todo.text);
  var formData = req.body.todo;
  Todo.create(formData, function (err, newTodo) {
    if (err) {
      res.render("new");
    } else {
      res.json(newTodo);
    }
  });
});

app.put("/todos/:id", function (req, res) {
  Todo.findByIdAndUpdate(req.params.id, req.body.todo, {
    new: true
  }, function (err, todo) {
    if (err) {
      console.log(err);
    } else {
      res.json(todo);
    }
  });
});

app.delete("/todos/:id", function (req, res) {
  Todo.findByIdAndRemove(req.params.id, function (err, todo) {
    if (err) {
      console.log(err);
    } else {
      res.json(todo);
    }
  });
});


app.listen(3000, function () {
  console.log('Server running on port 3000');
});

// // Uncomment the three lines of code below and comment out or remove lines 84 - 86 if using cloud9
// app.listen(process.env.PORT, process.env.IP, function(){
//     console.log("The server has started!");
// });