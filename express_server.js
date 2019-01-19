// https://github.com/tonykieling/tinny_app

var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['Key'],
  maxAge: 24 * 60 * 60 * 1000
}));

app.set("view engine", "ejs");

const bcrypt = require('bcrypt');

//function to generate a randomstring in order to be used as the shortURL
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

//initial database set with two shortURLs to diff users
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

// users database containing one test user PASSWORD = testp
const users = { 
  "test": {
    id: "test", 
    email: "test@test.com", 
    password: bcrypt.hashSync("testp", 10)
  }
};

app.get("/", (req, res) => {
  res.send("Hello WD!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


// function to insert shortURLs in the database
function userURLS (urls, user){
  let result = {};
  if (!user){
    return result;
  }
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
  return(result);
}


app.get("/urls", function (req, res) {
  let templateVars = {
    user: users[req.session.user_id],
    urls: userURLS(urlDatabase, users[req.session.user_id])
  }
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = {
    userID: req.session.user_id,
    shortURL: newShortURL,
    longURL: req.body.longURL
  };
  res.redirect(`http://localhost:8080/urls/${newShortURL}`);
});


app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
  }
  if (!req.session.user_id){
    res.render("login_page");
    return;
  }
    
  res.render("urls_new", templateVars);
});


app.get("/hello", (req, res) => {
  let templateVars = { greeting : 'Hello World!'};
  res.render("hello_world", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]){
    res.send("ShortURL not found");
  }
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});


// delete short url
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


app.get("/urls/:id", (req, res) => {
  let templateVars = { urls: urlDatabase[req.params.id] };
  if (!req.session.user_id){
    templateVars["user"] = null;
    res.render("no_user_page");
  } else {
    templateVars.user = users[req.session.user_id];
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
  if (!checkUser.length) {
    res.sendStatus(403);
    return;
  }
  if(bcrypt.compareSync(req.body.password, users[checkUser].password)) {
    req.session.user_id = checkUser;
    res.redirect("/urls");
  } else {
    res.sendStatus(403);
  }
});

// logout feature
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


// route to the user register page
app.get("/register", (req, res) => {
  res.render("user_register");
});


// route to register users
app.post("/register", (req, res) => {
  // check if the email or password are empty, if so, it sends 400
  if ((!req.body.email) || (!req.body.password)){
    res.sendStatus(400);
    return;
  }
  const checkUser = (Object.keys(users).filter(key =>
    users[key].email === req.body.email
  )).toString();
  if ((checkUser.length)){ // check whether user alread exists into the db, if so, error 
    res.sendStatus(400);
    return;
  }
  const randomUserId = generateRandomString();    // calling the function to generate a random set of characteres which is gonna be used as user's id
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[randomUserId] = {
    id: randomUserId,
    email: req.body.email,
    password: hashedPassword
  };

  req.session.user_id = randomUserId;
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

