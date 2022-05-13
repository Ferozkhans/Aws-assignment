const reviewModel = require("../models/reviewModel")
const booksModel = require("../models/booksModel")
const mongoose = require('mongoose');

// create Review
const createReview = async function (req, res) {
    try {
        const review = req.body
        let arr = Object.keys(review)
        if (arr.length == 0) return res.status(400).send({ staus: false, message: "Invalid request. Please provide Details" })
        let data = req.params.bookId;
        let book = await booksModel.findOne( { _id: data , isDeleted: false });
        if (!book) return res.status(404).send({ status: false, message: 'Book Not Found' })

        let dataCreated = await reviewModel.create(review)
        // book._doc["reviewdata"]=[dataCreated]
        let reviewData = await booksModel.findOneAndUpdate({ _id: data , isDeleted: false  },{},{new:true})
        res.status(201).send({status:true, message: 'Success',data: dataCreated });


    } catch (err) {
        res.status(500).send({ status: false, message: "Server not responding", error: err.message });
    }
}

// Update Review
const updateReviewById = async function (req, res) {
    try {
        let data = req.params.bookId;
        let data1 = req.params.reviewId;
        let updateData = req.body
        if (mongoose.Types.ObjectId.isValid(data) == false) {
            return res.status(400).send({ status: false, message: "Invalid book id" })
        }

        if (mongoose.Types.ObjectId.isValid(data1) == false) {
            return res.status(400).send({ status: false, message: "Invalid review id" })
        }

        const { review, rating, reviewedBy } = updateData
        let book1 = await booksModel.findOne({ _id: data }, { isDeleted: false });
        if (!book1) return res.status(404).send({ status: false, message: 'Book Not Found' })

        let book = await reviewModel.findOneAndUpdate({ _id: data1 ,bookId:data,  isDeleted: false  }, { review: review, rating: rating, reviewedBy: reviewedBy }, { new: true });
        if (!book) return res.status(404).send({ status: false, message: 'Book Not Found' })

        return res.status(200).send({ status: true, message: 'Success', data: book });
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

// delete Review
const deleteReviewById = async function (req, res) {
    try {
        let data = req.params.bookId;
        let data1 = req.params.reviewId
        if (mongoose.Types.ObjectId.isValid(data) == false) {
            return res.status(400).send({ status: false, message: "Invalid book id" })
        }

        if (mongoose.Types.ObjectId.isValid(data1) == false) {
            return res.status(400).send({ status: false, message: "Invalid review id" })
        }

        let book1 = await booksModel.findOne({ _id: data }, { isDeleted: false });
        if (!book1) return res.status(404).send({ status: false, message: 'Book Not Found or already deleted' })

        let book = await reviewModel.findOneAndUpdate({ _id: data1 , bookId: data,  isDeleted: false }, { isDeleted: true }, { new: true });
        if (!book) return res.status(404).send({ status: false, message: 'Review Not Found or already deleted' })
        return res.status(200).send({ status: true, message: 'Success', data: book });

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


module.exports = { createReview, updateReviewById, deleteReviewById }

