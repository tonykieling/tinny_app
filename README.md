# TinyApp

TinyApp is a full stack web application built with Node and Express which allows users to shorten long URLs.


## Final Product

* **Main Page** 

<img src="docs/first_screen.png" width="450" height="300"/>


* **User's Page**

<img src="docs/urls.png" width="450" height="300"/>


* **Creating New shortURLs**

<img src="docs/creating_shortURLs.png" width="450" height="300"/>


## Dependencies
* bcrypt
* body-parser
* cookie-session
* ejs
* express


## Getting started
1. Fork this repository, then clone your fork of this repository.
2. Install dependencies using the npm install command.
3. Start the web server by the command `node express_server.js`.
4. Go to http://localhost:3333/ in your browser.
5. For development and test purposes, there is a file in server/lib/util/mongo_example.js which cleans and starts the database with 3 documents.
6. There is a built-in user which `email` is `test@test.com` and `password` is `testp`.


## Improvements
- A better interface with CSS and Bootstrap.
- Buttons to return to previous pages.