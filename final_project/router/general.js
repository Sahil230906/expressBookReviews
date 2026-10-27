const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "User already exists!" });
  }

  users.push({ username: username, password: password });
  return res.status(200).json({ message: "User successfully registered. Now you can login." });
});

// Task 1: Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn], null, 4));
  }
  return res.status(404).json({ message: "Book not found for ISBN " + isbn });
});

// Task 3: Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  const keys = Object.keys(books);
  const result = [];

  keys.forEach((key) => {
    if (books[key].author.toLowerCase() === author) {
      result.push({ isbn: key, ...books[key] });
    }
  });

  if (result.length > 0) {
    return res.status(200).send(JSON.stringify({ booksbyauthor: result }, null, 4));
  }
  return res.status(404).json({ message: "No books found for author " + req.params.author });
});

// Task 4: Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  const keys = Object.keys(books);
  const result = [];

  keys.forEach((key) => {
    if (books[key].title.toLowerCase() === title) {
      result.push({ isbn: key, ...books[key] });
    }
  });

  if (result.length > 0) {
    return res.status(200).send(JSON.stringify({ booksbytitle: result }, null, 4));
  }
  return res.status(404).json({ message: "No books found with title " + req.params.title });
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  }
  return res.status(404).json({ message: "Book not found for ISBN " + isbn });
});

// Helper: send an Axios error back to the client
const handleAxiosError = (error, res) => {
  if (error.response) {
    return res.status(error.response.status).json(error.response.data);
  }
  return res.status(500).json({ message: "Error: " + error.message });
};

// Task 10: Get the list of books using async/await with Axios
public_users.get('/async/books', async function (req, res) {
  try {
    const response = await axios.get(BASE_URL + "/");
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return handleAxiosError(error, res);
  }
});

// Task 11: Get book details by ISBN using async/await with Axios
public_users.get('/async/isbn/:isbn', async function (req, res) {
  try {
    const response = await axios.get(BASE_URL + "/isbn/" + encodeURIComponent(req.params.isbn));
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return handleAxiosError(error, res);
  }
});

// Task 12: Get book details by author using async/await with Axios
public_users.get('/async/author/:author', async function (req, res) {
  try {
    const response = await axios.get(BASE_URL + "/author/" + encodeURIComponent(req.params.author));
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return handleAxiosError(error, res);
  }
});

// Task 13: Get book details by title using async/await with Axios
public_users.get('/async/title/:title', async function (req, res) {
  try {
    const response = await axios.get(BASE_URL + "/title/" + encodeURIComponent(req.params.title));
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return handleAxiosError(error, res);
  }
});

module.exports.general = public_users;