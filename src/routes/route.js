const express = require('express');
const router = express.Router();
const userController = require("../controllers/userControllers")
const booksController = require("../controllers/booksController")
const middleware = require("../middleWare/middleWare")


router.post("/user",userController.createUser)
router.post("/login", userController.loginUser)
router.post("/books", middleware.authentication, booksController.createBook)
router.get("/getBooks", middleware.authentication, booksController.getBook)
router.get("/getBook/:bookId", middleware.authentication,booksController.getById)
router.put("/updateBook/:bookId", middleware.authentication,middleware.authorisation,booksController.updateById)
router.delete("/deleteBook/:bookId", middleware.authentication,middleware.authorisation,booksController.deleteById)

module.exports = router; 
