// https://github.com/tonykieling/tinny_app

var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");


function generateRandomString() {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; //62
  let index = 0;
  let result = "";
  for (let c = 0; c < 6; c += 1){
    index = Math.floor(Math.random() * (62));
    result += possible[index];
  }
  return result;
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  "test": {
    id: "test", 
    email: "test@test.com", 
    password: "test"
  },
  "anotherrandomuser": {
    id: "anotherrandomuser", 
    email: "anotherrandomuser@anotherrandomuser.com", 
    password: "anotherrandomuser"
  }  
};

app.get("/", (req, res) => {
  res.send("Hello WD!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", function (req, res) {
  let templateVars = { urls: urlDatabase };
  if (!req.cookies.user_id){
    console.log("starting withouth cookie");
    templateVars["username"] = null;
    console.log(templateVars.username);
  } else {
    templateVars.username = req.cookies.user_id;
  }
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase };
  if (!req.cookies.user_id){
    console.log("starting withouth cookie");
    templateVars["username"] = null;
    console.log(templateVars.username);
  } else {
    templateVars.username = req.cookies.user_id;
  }  
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { urls: urlDatabase, shortURL: req.params.id };
  if (!req.cookies.user_id){
    templateVars["username"] = null;
  } else {
    templateVars.username = req.cookies.user_id;
  } 
  res.render("urls_show", templateVars);
  // res.render("urls_show");
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting : 'Hello World!'};
  res.render("hello_world", templateVars);
  // res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  console.log("NEW SERVER");
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL;
  res.redirect(`http://localhost:8080/urls/${newShortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

// delete short url
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// update short url
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

// login feature
app.post("/login", (req, res) => {
  console.log("cookie: " , req.body.username);
  res.cookie('user_id', req.body.username);
  res.redirect("/urls");
});

// logout feature
app.post("/logout", (req, res) => {
  res.clearCookie('name');
  res.redirect("/urls");
});

// route to the register page
app.get("/register", (req, res) => {
  res.render("user_register");
});

// route to register the user
app.post("/register", (req, res) => {
  console.log("register route");
  console.log("req.body.email: ", req.body.email, "req.body.password: ", req.body.password);
  const randomUserId = generateRandomString();
  console.log("new random user id: ", randomUserId);
  users[randomUserId] = {
    id: req.body.email,
    password: req.body.password
  };
  console.log("new user: ", users[randomUserId]);
  res.cookie('user_id', randomUserId);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

