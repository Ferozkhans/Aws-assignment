const userModel = require("../models/userModel")
const booksModel = require("../models/booksModel")
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const { query } = require("express");

//create book
const createBook = async function (req, res) {
  try {
    let user = req.body.userId;
    validUser = req.userId
    if(validUser.toString()!==user) {return res.status(403).send({staus:false,message:"Not Authorised!!"})}
  
    let book = req.body
    let arr = Object.keys(book)
    let ISBNs = /^[0-9-]{14}$/.test(req.body.ISBN)
    let date = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/.test(req.body.releasedAt) //YYYY-MM-DD

    let Title = await booksModel.findOne({ title: req.body.title });
    let isbn = await booksModel.findOne({ ISBN: req.body.ISBN });


    if (arr.length == 0) return res.status(400).send({ staus: false, message: "Invalid request. Please provide Details" })
    else if (Title) { return res.status(409).send({ message: "This title already exist" }) }
    else if (!book.title) return res.status(400).send({ staus: false, message: "title is required" })
    else if (!book.excerpt) return res.status(400).send({ staus: false, message: "excerpt is required" })
    else if (!book.userId) return res.status(400).send({ staus: false, message: "userId is required" })
    else if (mongoose.Types.ObjectId.isValid(req.body.userId) == false) return res.status(400).send({ staus: false, message: "user Id is Invalid" })
    else if (isbn) { return res.status(409).send({ message: "This ISBN already exist" }) }
    else if (!book.ISBN) return res.status(400).send({ staus: false, message: "ISBN is required" })
    else if (!book.category) return res.status(400).send({ staus: false, message: "category is required" })
    else if (!book.subcategory) return res.status(400).send({ staus: false, message: "subcategory is required" })
    else if (!book.releasedAt) return res.status(400).send({ staus: false, message: "releasedAT is required" })
    else if (ISBNs === false) return res.status(400).send({ staus: false, message: "Please Enter valid ISBN." })
    else if (date === false) return res.status(400).send({ staus: false, message: "Please Enter valid date formaat yyyy-mm-dd." })

    if (req.body.isDeleted === true) {
      req.body.deletedAt = new Date().toLocaleString();
    }
    //findById is used to find the single author _id, that matches the given id, given by the frontend.
    let Id = await userModel.findById({ _id: user });

    if (Id) {
      let dataCreated = await booksModel.create(book);
      res.status(201).send({status:true, message: 'Success',data: dataCreated });
    } else {
      res.status(400).send({ status: false, message: "USER does not exist!" });
    }
  } catch (err) {
    res.status(500).send({ status: false, message: "Server not responding.", error: err.message, });
  }
};

// Get book
const getBook = async function (req, res) {
  let filterquery= req.query
  try {
  
    if (Object.keys(filterquery).length==0) {
      let books = await booksModel.find({ isDeleted: false }).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).sort({ title: 1 });
      // check data exits or not
      if (books.length == 0) return res.status(404).send({ status: false, message: 'Book Not Found' })
      return res.status(200).send({ status: true,message: 'Success', data: books });
    }
    let result= await booksModel.find({$and:[{isDeleted: false },filterquery]}).sort({ title: 1 });

    if (result.length==0) return res.status(404).send({ status: false, message: 'Book Not Found' })
    return res.status(200).send({ status: true, message: 'Success',data: result });
  }
  catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
};

//Get by id
const getById = async function (req, res) {
  try {
    let data = req.params.bookId;
    let book = await booksModel.findOne({ _id: data }, { isDeleted: false });
    if (!book) return res.status(404).send({ status: false, message: 'Book Not Found' })
    book._doc["reviewdata"] = []
    res.status(200).send({status:true, message: 'Success',data:book });
  }

  catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
}

//Update
const updateById = async function (req, res) {
  try {
    let data = req.params.bookId;
    let updateData = req.body
    const { title, excerpt, releasedAt, ISBN } = updateData
    let duplicate = await booksModel.findOne({ $or: [{ title: title }, { ISBN: ISBN }] })
    if (duplicate) return res.status(409).send({ status: false, message: 'Title or ISBN already exist.' })
    let book = await booksModel.findOneAndUpdate({ $and: [{ _id: data }, { isDeleted: false }] }, { title: title, excerpt: excerpt, releasedAt: releasedAt, ISBN: ISBN }, { new: true });
    if (!book) return res.status(404).send({ status: false, message: 'Book Not Found' })

    return res.status(200).send({ status: true,message: 'Success', data: book });
  }
  catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
}

//Delete 
const deleteById = async function (req, res) {
  try {
    let data = req.params.bookId;
    let book = await booksModel.findOneAndUpdate({ $and: [{ _id: data }, { isDeleted: false }] },
      { isDeleted: true, deletedAt: new Date().toLocaleString() }, { new: true });

    if (!book) return res.status(404).send({ status: false, message: 'Book Not Found or already deleted.' })
    return res.status(200).send({ status: true, message: 'Success',data: book });
  }
  catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
}

module.exports = { createBook, getBook, getById, updateById, deleteById }




