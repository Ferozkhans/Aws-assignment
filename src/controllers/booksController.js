const userModel = require("../models/userModel")
const booksModel = require("../models/booksModel")
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const { query } = require("express");

//create book
const createBook = async function (req, res) {
  try {
    let user = req.body.userId;
    let book = req.body
    let arr = Object.keys(book)
    let ISBNs = /^[0-9-]{14}$/.test(req.body.ISBN)
    let date = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/.test(req.body.releasedAt) //YYYY-MM-DD

    let Title = await booksModel.findOne({ title: req.body.title });
    let isbn = await booksModel.findOne({ ISBN: req.body.ISBN });


    if (arr.length == 0) return res.status(400).send({ staus: false, Error: "Invalid request. Please provide Details" })
    else if (Title) { return res.status(409).send({ Error: "This title already exist" }) }
    else if (!book.title) return res.status(400).send({ staus: false, Error: "title is required" })
    else if (!book.excerpt) return res.status(400).send({ staus: false, Error: "excerpt is required" })
    else if (!book.userId) return res.status(400).send({ staus: false, Error: "userId is required" })
    else if (mongoose.Types.ObjectId.isValid(req.body.userId) == false) return res.status(400).send({ staus: false, Error: "user Id is Invalid" })
    else if (isbn) { return res.status(409).send({ Error: "This ISBN already exist" }) }
    else if (!book.ISBN) return res.status(400).send({ staus: false, Error: "ISBN is required" })
    else if (!book.category) return res.status(400).send({ staus: false, Error: "category is required" })
    else if (!book.subcategory) return res.status(400).send({ staus: false, Error: "subcategory is required" })
    else if (!book.releasedAt) return res.status(400).send({ staus: false, Error: "releasedAT is required" })
    else if (ISBNs === false) return res.status(400).send({ staus: false, Error: "Please Enter valid ISBN." })
    else if (date === false) return res.status(400).send({ staus: false, Error: "Please Enter valid date formaat yyyy-mm-dd." })

    if (req.body.isDeleted === true) {
      req.body.deletedAt = new Date().toLocaleString();
    }
    //findById is used to find the single author _id, that matches the given id, given by the frontend.
    let Id = await userModel.findById({ _id: user });

    if (Id) {
      let dataCreated = await booksModel.create(book);
      res.status(201).send({ status: true, data: dataCreated });
    } else {
      res.status(400).send({ status: false, Error: "USER does not exist!" });
    }
  } catch (err) {
    res.status(500).send({ status: false, Error: "Server not responding.", error: err.message, });
  }
};

// Get book

const getBook = async function (req, res) {
  let category = req.query.category
  let user = req.query.userId
  let sub = req.query.subcategory
  try {
  
    if (!category && !user && !sub) {
      let books = await booksModel.find({ isDeleted: false }).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).sort({ "title": 1 });
      // check data exits or not

      //  let sortedBooks= books.sort((a, b) => (a["title"] || "").toString().localeCompare((b["title"] || "").toString()))
      if (books.length == 0) return res.status(404).send({ status: false, msg: 'Book Not Found' })
      return res.status(200).send({ status: true, data: books });
    }
    if (mongoose.Types.ObjectId.isValid(user) == false) {
      return res.status(400).send({ status: false, msg: "Invalid user id" })
    }
    let result = await booksModel.find({$and:[{ isDeleted: false}, {$or: [{ userId: user }, { category: category }, { subcategory: sub }] }]}).sort({ "title": 1 });
    if (!result.length) return res.status(404).send({ status: false, msg: 'Book Not Found' })
    return res.status(200).send({ status: true, data: result });
  }
  catch (err) {
    return res.status(500).send({ status: false, msg: err.message })
  }
};

//Get by id
const getById = async function (req, res) {
  try {
    let data = req.params.bookId;
    let book = await booksModel.findOne({ _id: data }, { isDeleted: false });
    if (!book) return res.status(404).send({ status: false, msg: 'Book Not Found' })
    book._doc["reviewdata"] = []
    return res.status(200).send({ status: true, data: book });
  }

  catch (err) {
    return res.status(500).send({ status: false, msg: err.message })
  }
}

//Update
const updateById = async function (req, res) {
  try {
    let data = req.params.bookId;
    let updateData = req.body
    const { title, excerpt, releasedAt, ISBN } = updateData
    let duplicate = await booksModel.findOne({ $or: [{ title: title }, { ISBN: ISBN }] })
    if (duplicate) return res.status(409).send({ status: false, msg: 'Title or ISBN already exist.' })
    let book = await booksModel.findOneAndUpdate({ $and: [{ _id: data }, { isDeleted: false }] }, { title: title, excerpt: excerpt, releasedAt: releasedAt, ISBN: ISBN }, { new: true });
    if (!book) return res.status(404).send({ status: false, msg: 'Book Not Found' })

    return res.status(200).send({ status: true, data: book });
  }

  catch (err) {
    return res.status(500).send({ status: false, msg: err.message })
  }
}

//Delete 
const deleteById = async function (req, res) {
  try {
    let data = req.params.bookId;
    let book = await booksModel.findOneAndUpdate({ $and: [{ _id: data }, { isDeleted: false }] },
      { isDeleted: true, deletedAt: new Date().toLocaleString() }, { new: true });

    if (!book) return res.status(404).send({ status: false, msg: 'Book Not Found or already deleted.' })
    return res.status(200).send({ status: true, data: book });
  }
  catch (err) {
    return res.status(500).send({ status: false, msg: err.message })
  }
}

module.exports = { createBook, getBook, getById, updateById, deleteById }




