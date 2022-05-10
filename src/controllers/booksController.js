const userModel = require("../models/userModel")
const booksModel = require("../models/booksModel")
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const { query } = require("express");

//create book
const createBook = async function (req, res) {
  try {
    let user = req.body.userId;
    let blog = req.body
    let arr = Object.keys(blog)
    let ISBNs = /^[0-9-]{14}$/.test(req.body.ISBN)
    let date = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/.test(req.body.releasedAt)

    let blogs = await booksModel.findOne({ title: req.body.title });
    let isbn = await booksModel.findOne({ ISBN: req.body.ISBN });


    if (arr.length == 0) return res.status(400).send({ staus: false, Error: "Invalid request. Please provide Details" })
    else if (blogs) { return res.status(409).send({ Error: "This title already exist" }) }
    else if (!blog.title) return res.status(400).send({ staus: false, Error: "title is required" })
    else if (!blog.excerpt) return res.status(400).send({ staus: false, Error: "excerpt is required" })
    else if (!blog.userId) return res.status(400).send({ staus: false, Error: "userId is required" })
    else if (mongoose.Types.ObjectId.isValid(req.body.userId) == false) return res.status(400).send({ staus: false, Error: "user Id is Invalid" })
    else if (isbn) { return res.status(409).send({ Error: "This ISBN already exist" }) }
    else if (!blog.ISBN) return res.status(400).send({ staus: false, Error: "ISBN is required" })
    else if (!blog.category) return res.status(400).send({ staus: false, Error: "category is required" })
    else if (!blog.subcategory) return res.status(400).send({ staus: false, Error: "subcategory is required" })
    else if (!blog.releasedAt) return res.status(400).send({ staus: false, Error: "releasedAT is required" })
    else if (ISBNs === false) return res.status(400).send({ staus: false, Error: "Please Enter valid ISBN." })
    else if (date === false) return res.status(400).send({ staus: false, Error: "Please Enter valid date formaat yy-mm-dd." })

    if (req.body.isDeleted === true) {
      req.body.deletedAt = new Date()
    }
    //findById is used to find the single author _id, that matches the given id, given by the frontend.
    let Id = await userModel.findById({ _id: user });

    if (Id) {
      let dataCreated = await booksModel.create(blog);
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
      if (books.length == 0) return res.status(404).send({ status: false, msg: 'Book Not Found' })
      else if (books) { return res.status(200).send({ status: true, data: books }) };
    }
    let result = await booksModel.find({ isDeleted: false, $or: [{ userId: user }, { category: category }, { subcategory: [sub] }] }).sort({ "title": 1 });
    if (!result.length) return res.status(404).send({ status: false, msg: 'Book Not Found' })
    return res.status(200).send({ status: true, data: result });
  }
  catch (err) {
    return res.status(500).send({ status: false, msg: err.message })
  }
}




module.exports = { createBook, getBook }




