const express = require('express');
const router = express.Router();
const userController = require("../controllers/userControllers")
const booksController = require("../controllers/booksController")
const middleware = require("../middleWare/middleWare")


router.post("/user",userController.createUser)


router.post("/login", userController.loginUser)
router.post("/books", middleware.authentication, booksController.createBook)
router.get("/getBooks", middleware.authentication, booksController.getBook)


module.exports = router;
