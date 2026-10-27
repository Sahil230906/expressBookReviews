const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Returns true if the username is not taken yet
const isValid = (username) => {
  return !users.some((user) => user.username === username);
};

// Returns true if username and password match a registered user
const authenticatedUser = (username, password) => {
  return users.some((user) => user.username === username && user.password === password);
};

// Task 7: Only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid login. Check username and password." });
  }

  const accessToken = jwt.sign({ data: password }, "access", { expiresIn: 60 * 60 });
  req.session.authorization = { accessToken, username };

  return res.status(200).json({ message: "User successfully logged in" });
});

// Task 8: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found for ISBN " + isbn });
  }

  if (!review) {
    return res.status(400).json({ message: "Please provide a review as a query parameter." });
  }

  books[isbn].reviews[username] = review;
  return res.status(200).json({
    message: "Review for ISBN " + isbn + " added/updated successfully.",
    reviews: books[isbn].reviews
  });
});

// Task 9: Delete a book review (only your own)
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found for ISBN " + isbn });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review by " + username + " found for ISBN " + isbn });
  }

  delete books[isbn].reviews[username];
  return res.status(200).json({ message: "Review for ISBN " + isbn + " by " + username + " deleted." });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;