const express = require('express');
const router = express.Router();
const userController = require("../controllers/userControllers")
const booksController = require("../controllers/booksController")
const reviewController = require("../controllers/reviewControllers")
const middleware = require("../middleWare/middleWare")

// User
router.post("/user",userController.createUser)
router.post("/login", userController.loginUser)
// Book
router.post("/books", middleware.authentication,booksController.createBook) 
router.get("/getBooks", middleware.authentication, booksController.getBook)
router.get("/getBook/:bookId", middleware.authentication,booksController.getById)
router.put("/updateBook/:bookId", middleware.authentication,middleware.authorisation,booksController.updateById)
router.delete("/deleteBook/:bookId", middleware.authentication,middleware.authorisation,booksController.deleteById)
// Review
router.post("/books/:bookId/review",reviewController.createReview)
router.put("/books/:bookId/review/:reviewId",reviewController.updateReviewById)
router.delete("/books/:bookId/review/:reviewId",reviewController.deleteReviewById)
module.exports = router;  
