const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

let getbooklistpromise = new Promise((resolve, reject) => {
  const booklist = JSON.stringify(books, null, 4);
  resolve(booklist);
})
// Get the book list available in the shop
public_users.get('/',function (req, res) {
  getbooklistpromise.then((booklist) => {
    res.send("Basic" + booklist);
  }).catch((error) => {
    console.error(error);
    res.status(500).send("Error retrieving booklist");
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  let getbookbyisbnpromise = new Promise((resolve, reject) => {
    const isbn = req.params.isbn;
    const bookbyisbn = books[isbn];
    if (bookbyisbn) {
    resolve(bookbyisbn);
  } else {
    reject(new Error(error));
  }
  });

  getbookbyisbnpromise.then((bookbyisbn) => {
    res.send(bookbyisbn);
  }).catch((error) => {
    console.error(error);
    res.status(404).send(`Error retrieving book with ISBN No. ${req.params.isbn}`)
  });  
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let getbooksbyauthorpromise = new Promise((resolve, reject) => {
    const authortofind = req.params.author;
    const booksbyauth = Object.keys(books).filter(
      key => books[key].author === authortofind
      ).map(key => books[key]);
    if (booksbyauth.length > 0) {
    resolve(booksbyauth);
    } else {
      reject (new Error());
    }
  });

  getbooksbyauthorpromise.then((booksbyauth) => {
    res.send(booksbyauth);
  }).catch((error) => {
    res.status(404).send(`Error retrieving books by author: ${req.params.author}`)
  });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  let getbooksbytitlepromise = new Promise((resolve, reject) => {
    const titletofind = req.params.title;
    const booksbytitle = Object.keys(books).filter(
      key => books[key].title === titletofind
    ).map(key => books[key]);
    if(booksbytitle.length > 0){
    resolve(booksbytitle);
    } else {
      reject(new Error());
    }
  });

  getbooksbytitlepromise.then((booksbytitle) => {
    res.send(booksbytitle);
  }).catch((error) => {
    res.status(404).send(`Error retrieving books with title: ${req.params.title}`)
  });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn].reviews)
});

module.exports.general = public_users;