const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Check if username & password are provided
    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    // Check if username is valid
    if (!isValid(username)) {
        return res.status(400).json({
            message: "Invalid username"
        });
    }

    // Check if user already exists
    const exists = users.find(user => user.username === username);

    if (exists) {
        return res.status(409).json({
            message: "User already exists"
        });
    }

    // Register new user
    users.push({ username, password });

    return res.status(200).json({
        message: "User registered successfully"
    });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    return new Promise((resolve, reject) => {
        try {
            resolve(res.status(200).json(JSON.parse(JSON.stringify(books))));
        } catch (error) {
            reject(res.status(500).json({ message: "Error fetching books" }));
        }
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    const book = books[isbn];

    if (book) {
        return res.status(200).json(book);
    }

    return res.status(404).json({ message: "Book not found" });
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author.toLowerCase();

    let result = {};

    const keys = Object.keys(books);

    for (let i = 0; i < keys.length; i++) {
        let isbn = keys[i];

        if (books[isbn].author.toLowerCase() === author) {
            result[isbn] = books[isbn];
        }
    }

    if (Object.keys(result).length === 0) {
        return res.status(404).json({ message: "No books found for this author" });
    }

    return res.status(200).json(JSON.parse(JSON.stringify(result)));
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase();

    let result = {};

    const keys = Object.keys(books);

    for (let i = 0; i < keys.length; i++) {
        let isbn = keys[i];

        if (books[isbn].title.toLowerCase() === title) {
            result[isbn] = books[isbn];
        }
    }

    if (Object.keys(result).length === 0) {
        return res.status(404).json({ message: "No books found for this title" });
    }

    return res.status(200).json(JSON.parse(JSON.stringify(result)));
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json(JSON.parse(JSON.stringify(book.reviews)));
});

module.exports.general = public_users;
