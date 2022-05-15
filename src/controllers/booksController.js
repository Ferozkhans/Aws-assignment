const userModel = require("../models/userModel")
const booksModel = require("../models/booksModel")
const reviewModel = require("../models/reviewModel")
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const { query } = require("express");

//create book
const createBook = async function (req, res) {
  try {
    let user = req.body.userId;
    validUser = req.userId
    if (mongoose.Types.ObjectId.isValid(user) == false) {
      return res.status(400).send({ status: false, message: "Invalid book id" })
  }
    if(validUser!==user) {return res.status(403).send({staus:false,message:"Not Authorised!!"})}
  
    let Book = req.body
    let arr = Object.keys(Book)
    let ISBNs = /^[0-9-]{14}$/.test(req.body.ISBN)
    let date = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/.test(req.body.releasedAt) //YYYY-MM-DD

    let Title = await booksModel.findOne({ title: req.body.title });
    let isbn = await booksModel.findOne({ ISBN: req.body.ISBN });


    if (arr.length == 0) return res.status(400).send({ staus: false, message: "Invalid request. Please provide Details" })
    else if (Title) { return res.status(409).send({ message: "This title already exist" }) }
    else if (!Book.title) return res.status(400).send({ staus: false, message: "title is required" })
    else if (!Book.excerpt) return res.status(400).send({ staus: false, message: "excerpt is required" })
    else if (Book.excerpt == false ) return res.status(400).send({ staus: false, message: "plz provide excerpt details" })
    else if (Book.category == false ) return res.status(400).send({ staus: false, message: "plz provide category details" })
    else if (!Book.userId) return res.status(400).send({ staus: false, message: "userId is required" })
    else if (isbn) { return res.status(409).send({ message: "This ISBN already exist" }) }
    else if (!Book.ISBN) return res.status(400).send({ staus: false, message: "ISBN is required" })
    else if (!Book.category) return res.status(400).send({ staus: false, message: "category is required" })
    else if (!Book.subcategory) return res.status(400).send({ staus: false, message: "subcategory is required" })
    else if (!Book.releasedAt) return res.status(400).send({ staus: false, message: "releasedAT is required" })
    else if (ISBNs === false) return res.status(400).send({ staus: false, message: "Please Enter valid ISBN." })
    else if (date === false) return res.status(400).send({ staus: false, message: "Please Enter valid date formaat yyyy-mm-dd." })

    if (req.body.isDeleted === true) {
      req.body.deletedAt = new Date().toLocaleString();
    }
    //findById is used to find the single author _id, that matches the given id, given by the frontend.
    let Id = await userModel.findById({ _id: user });

    if (Id) {
      let dataCreated = await booksModel.create(Book);
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
       let id = req.query.userId
       if (req.query.subcategory == false ) return res.status(400).send({ staus: false, message: "plz provide subcategory details" })
       if (req.query.category == false ) return res.status(400).send({ staus: false, message: "plz provide category details" })
       if(id){
       if (mongoose.Types.ObjectId.isValid(id) == false) {
        return res.status(400).send({ status: false, Error: "userId Invalid" });
      }}

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
    let bookId = req.params.bookId;
    if (mongoose.Types.ObjectId.isValid(bookId) == false) {
      return res.status(400).send({ status: false, Error: "userId Invalid" });
    }
    // let book = await booksModel.findOne({ _id: data }, { isDeleted: false });
     if (!bookId) return res.status(404).send({ status: false, msg: 'Book id is required' })
 
     let book= await booksModel.findById({ _id: bookId, isDeleted: false })
     let {...data} = book._doc
 
     let reviewdata = await reviewModel.find({bookId: bookId}).select({isDeleted: 0, updatedAt: 0, createdAt: 0, __v: 0})
     console.log(reviewdata)
 
     data.reviewsData = reviewdata 
 
      return res.status(200).send({ status: true, message: 'Books list', data: data})
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




