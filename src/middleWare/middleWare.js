const jwt = require("jsonwebtoken");
const bookModel = require("../models/booksModel");
const mongoose = require('mongoose');

const authentication = function (req, res, next) {
    try {
        // getting token from req(header)
        let token = req.headers["x-api-key"];
        if (!token) token = req.headers["X-Api-Key"];
        if (!token) {
            return res.status(400).send({ Error: "Enter x-api-key In Header" });
        }
        let decodeToken = jwt.decode(token)
        if (!decodeToken) {
            return res.status(401).send({ status: false, msg: "Not a valid Token " })
        }
        // token verification
        let checktoken = jwt.verify(token, "project3-uranium")
        if (!checktoken) { return res.status(401).send({ msg: "please enter valid token" }) }
        next()
    }
    catch (err) {
        res.status(500).send({ msg: err.message });
    }
}


const authorisation = async function (req, res, next) {
    try {
        let data = req.params.bookId
        let token = req.headers["x-api-key"];
        if (!token) token = req.headers["X-Api-Key"]
        if (!token) {
            return res.status(400).send({ Error: "Enter x-api-key In Header" });
        }
        if (mongoose.Types.ObjectId.isValid(data) == false) {
            return res.status(400).send({ status: false, msg: "Invalid book id" })
        }
        let decodedToken = jwt.verify(token, "project3-uranium")
        let bookId = req.params.bookId;

        let decoded = decodedToken.userId
        let book = await bookModel.findById(bookId);
        if (!book) {
            return res.status(404).send("Book doesn't exist");
        }
        let Book = book.userId.toString()
        console.log(Book)
        if (Book != decoded) {
            return res.status(403).send("Not Authorised!!")
        }
        next()
    }
    catch (err) {
        return res.status(500).send({ msg: err.message });
    }
}


module.exports.authentication = authentication;
module.exports.authorisation = authorisation;