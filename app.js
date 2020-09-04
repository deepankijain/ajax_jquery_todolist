const express = require("express");
const mongoose = require("mongoose");
const expressSanitizer = require("express-sanitizer");

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

const todoSchema = new mongoose.Schema({
  text: String,
});

const Todo = mongoose.model("Todo", todoSchema);

app.get("/", (req, res) => {
  res.redirect("/todos");
});

app.get("/todos", (req, res) => {
  Todo.find({}, (err, todos) => {
    if (err) {
      console.log(err);
    } else {
      if (req.xhr) {
        res.json(todos);
      } else {
        res.render("index", {
          todos
        });
      }
    }
  })
});

app.post("/todos", (req, res) => {
  req.body.todo.text = req.sanitize(req.body.todo.text);
  const formData = req.body.todo;
  Todo.create(formData, (err, newTodo) => {
    if (err) {
      res.render("new");
    } else {
      res.json(newTodo);
    }
  });
});

app.put("/todos/:id", (req, res) => {
  Todo.findByIdAndUpdate(req.params.id, req.body.todo, {
    new: true
  }, (err, todo) => {
    if (err) {
      console.log(err);
    } else {
      res.json(todo);
    }
  });
});

app.delete("/todos/:id", (req, res) => {
  Todo.findByIdAndRemove(req.params.id, (err, todo) => {
    if (err) {
      console.log(err);
    } else {
      res.json(todo);
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});