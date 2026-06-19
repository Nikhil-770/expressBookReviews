const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
    return username && typeof username === "string" && username.trim().length > 0;
    //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{
    return users.some(user => user.username === username && user.password === password);
    //returns boolean
//write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // create JWT token
    let accessToken = jwt.sign(
        { username: username },
        "fingerprint_customer",
        { expiresIn: "1h" }
    );

    // store token in session
    req.session.accessToken = accessToken;

    return res.status(200).json({
        message: "Login successful",
        token: accessToken
    });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;

    // Check if user is logged in
    const token = req.session.accessToken;

    if (!token) {
        return res.status(401).json({ message: "User not logged in" });
    }

    let username;

    try {
        const decoded = jwt.verify(token, "fingerprint_customer");
        username = decoded.username;
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }

    // Check if book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check review input
    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }

    // Add or update review
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: "Review added/updated successfully",
        reviews: books[isbn].reviews
    });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    // Get token from session
    const token = req.session.accessToken;

    if (!token) {
        return res.status(401).json({ message: "User not logged in" });
    }

    let username;

    try {
        const decoded = jwt.verify(token, "fingerprint_customer");
        username = decoded.username;
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }

    // Check if book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if review exists for this user
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found for this user" });
    }

    // Delete only logged-in user's review
    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: "Review deleted successfully",
        reviews: books[isbn].reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
