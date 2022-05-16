const express = require('express');
const router = express.Router();
const userController = require("../controllers/userControllers")
const booksController = require("../controllers/booksController")
const reviewController = require("../controllers/reviewControllers")
const middleware = require("../middleWare/middleWare")

// User
router.post("/register",userController.createUser)
router.post("/login", userController.loginUser)
// Book
router.post("/books", middleware.authentication,booksController.createBook) 
router.get("/books", middleware.authentication, booksController.getBook)
router.get("/books/:bookId", middleware.authentication,booksController.getById)
router.put("/books/:bookId", middleware.authentication,middleware.authorisation,booksController.updateById)
router.delete("/books/:bookId", middleware.authentication,middleware.authorisation,booksController.deleteById)
// Review
router.post("/books/:bookId/review",reviewController.createReview)
router.put("/books/:bookId/review/:reviewId",reviewController.updateReviewById)
router.delete("/books/:bookId/review/:reviewId",reviewController.deleteReviewById)
module.exports = router;  
