//console.log("hello server");
import express from "express";

// Node core modules
// directory path of our system
import path from "path";
// file system
import fs from "fs";

const _dirname = path.resolve();

// Initialize an express app
const app = express();

// Define a port
const PORT = 3000;

// current logged in user
let loggedUser = "";

// Index route
app.get("/", (req, res) => {
  //   Send a html code as response
  res.redirect("/login");
});

// GET
// Sign up Route
// res: Send Whole HTML File | Server Side Rendering
app.get("/signup", (req, res) => {
  res.sendFile(`${_dirname}/pages/signup.html`);
});

// Login Route
app.get("/login", (req, res) => {
  res.sendFile(`${_dirname}/pages/login.html`);
});

// send name
app.get("/sabin", (req, res) => {
  res.send("<h1>Sabin Acharya</h1> \n <a href='sabinacharya.com>Sabin</a>");
});

// forgot password
app.get("/forgotpassword", (req, res) => {
  res.sendFile(_dirname + "/pages/forgotPassword.html");
});

// homepage
app.get("/users/:name", (req, res) => {
  const { name } = req.params;
  if (loggedUser === name)
    return res.sendFile(_dirname + "/pages/homepage.html");
  res.redirect("/login");
});

// logout
app.get("/logout", (req, res) => {
  loggedUser = "";
  res.redirect("login");
});

// redirect all unmatched routes
app.get("*", (req, res) => {
  res.sendFile(_dirname + "/pages/wrongurl.html");
});
// Middleware
app.use(express.urlencoded({ extended: true }));

// POST

// Sign up  post route | collect data from sign up form submission
// res: Send Whole HTML File | Server Side Rendering
app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  //   store email in a file which is fake db for us
  const userRecords = email + "|" + password + "\n";
  const fileName = _dirname + "/userList.csv";

  if (name && email && password) {
    //   write user record to file
    fs.appendFile(fileName, userRecords, (error) => {
      error ? console.log(error) : console.log("Data Saved Successfully");
    });
    res.sendFile(_dirname + "/pages/passwordChangeSuccess.html");
  } else {
    res.sendFile(_dirname + "/pages/signupError.html");
  }
});

// Login end point | verify if the user is valid or not
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const userRecords = email + "|" + password;
  const fileName = _dirname + "/userList.csv";

  if (email && password) {
    fs.readFile(fileName, (error, data) => {
      if (error) {
        return res.send(error.message);
      }

      const users = data.toString();
      users.split("\n").includes(userRecords)
        ? (res.redirect("/users/" + email), (loggedUser = email))
        : res.sendFile(_dirname + "/pages/invalidPassword.html");
    });
  } else {
    res.sendFile(_dirname + "/pages/invalidPassword.html");
  }
});

// forgot password end point |
app.post("/forgotpassword", (req, res) => {
  const { email, password } = req.body;
  const userRecords = email + "|" + password;
  const fileName = _dirname + "/userList.csv";

  fs.readFile(fileName, (error, data) => {
    if (error) return res.send(error.message);
    const users = data.toString();

    if (users.includes(email)) {
      // removing previous record
      const userRequest = users
        .split("\n")
        .filter((item) => !item.includes(email));
      // adding replaced record
      const newRecord = [...userRequest, userRecords];
      // converting array to string
      const newDataString = newRecord.join("\n");

      fs.writeFile(fileName, newDataString, (error) => {
        error
          ? res.send(error.message)
          : res.sendFile(_dirname + "/pages/passwordChangeSuccess.html");
      });
    } else {
      res.sendFile(_dirname + "/pages/passwordChangeFailure.html");
    }
  });
});

// Start your server
app.listen(PORT, (error) => {
  error
    ? console.log("Error", error)
    : console.log("Server running on http://localhost:" + PORT);
});
