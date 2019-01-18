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
  "b2xVn2":{
    shortURL: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    userID: "test"
  },
  "9sm5xK":{
    shortURL:"9sm5xK",
    longURL: "http://www.google.com",
    userID: "user1"
  }
}


const users = { 
  "test": {
    id: "test", 
    email: "test@test.com", 
    password: "testp"
  },
  "user1": {
    id: "user1", 
    email: "user1@anotherrandomuser.com", 
    password: "anotherrandomuser"
  },  
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

app.get("/", (req, res) => {
  res.send("Hello WD!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


function userURLS (urls, user){
  let result = {};
  if (!user){
    console.log("NO user");
    return result;
  }
  // console.log("urls: ", urls);
  // console.log("user: ", user.id);
  for (let shortURL in urls){
    let url = urls[shortURL];
    if (url.userID === user.id){
      result[shortURL] = {
        shortURL: url.shortURL, 
        longURL: url.longURL,
        userID: user.id
      }
    }
  }
  // console.log("result: ", result);
  return(result);
}


app.get("/urls", function (req, res) {
  // console.log("-GET/urls");
  // console.log("user::", users[req.cookies.user_id]);

  let templateVars = {
    user: users[req.cookies.user_id],
    urls: userURLS(urlDatabase, users[req.cookies.user_id])
  }
  // console.log("New urldb::: ", templateVars);
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  let newShortURL = generateRandomString();
  // console.log("url-POST");
  // console.log("req.cookies.user_id: ", req.cookies.user_id);
  urlDatabase[newShortURL] = {
    userID: req.cookies.user_id,
    shortURL: newShortURL,
    longURL: req.body.longURL
  };
  // urlDatabase["userID"] = req.cookies.user_id;
  // console.log("new URLdb: ", urlDatabase);
  res.redirect(`http://localhost:8080/urls/${newShortURL}`);
});


app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies.user_id],
  }
  if (!req.cookies.user_id){
    res.render("login_page");
    return;
  }
    
  res.render("urls_new", templateVars);
});


app.get("/hello", (req, res) => {
  let templateVars = { greeting : 'Hello World!'};
  res.render("hello_world", templateVars);
  // res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/u/:shortURL", (req, res) => {
  console.log("hereeeeee: ", req.params.shortURL);
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});


// delete short url
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


app.get("/urls/:id", (req, res) => {
  let templateVars = { urls: urlDatabase, shortURL: req.params.id };
  if (!req.cookies.user_id){
    templateVars["user"] = null;
    res.render("no_user_page");
    // return;
  } else {
    templateVars.user = users[req.cookies.user_id];
    res.render("urls_show", templateVars);
  }
});


// update short url
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});


// login feature
app.get("/login", (req, res) => {
  res.render("login_page");
});

app.post("/login", (req, res) => {
  const checkUser = (Object.keys(users).filter(key =>
    users[key].email === req.body.email
  )).toString();
  // console.log("checkUserXXXX: ", checkUser);
  if (!checkUser.length) {
    // console.log("No user");
    res.sendStatus(403);
    return;
  }
  // console.log("req.body.email: ", req.body.email, "req.body.password: ", req.body.password);
  // console.log(users[checkUser].password);
  if (req.body.password !== users[checkUser].password){
    // console.log("User, but wrong password");
    res.sendStatus(403);
    return;
  }
  // console.log("user alread exists");
  res.cookie('user_id', checkUser);
  res.redirect("/urls");
});

// logout feature
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});


// route to the register page
app.get("/register", (req, res) => {
  res.render("user_register");
});

// route to register the user
app.post("/register", (req, res) => {
  // check if the email or password are empty, if so, it sends 400
  if ((!req.body.email) || (!req.body.password)){
    res.sendStatus(400);
    return;
  }
  const checkUser = (Object.keys(users).filter(key =>
    users[key].email === req.body.email
  )).toString();
  if ((checkUser.length)){ // || (checkUser === [])) {
    res.sendStatus(400);
    return;
  }
  const randomUserId = generateRandomString();
  users[randomUserId] = {
    id: randomUserId,
    email: req.body.email,
    password: req.body.password
  };
  // console.log("new user: ", users[randomUserId]);
  res.cookie('user_id', randomUserId);
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

