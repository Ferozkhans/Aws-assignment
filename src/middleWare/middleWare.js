const jwt = require("jsonwebtoken");
const bookModel = require("../models/booksModel");
const mongoose = require('mongoose');

const authentication = function (req, res, next) {
    try {
        // getting token from req(header)
        let token = req.headers["x-api-key"];
        if (!token) token = req.headers["X-Api-Key"];
        if (!token) {
            return res.status(400).send({ status:false,message: "Enter x-api-key In Header" });
        }
        let decodeToken = jwt.decode(token)
        if (!decodeToken) {
            return res.status(401).send({ status: false, message: "Not a valid Token " })
        }
        // token verification
        let checktoken = jwt.verify(token, "project3-uranium")
        if (!checktoken) { return res.status(401).send({ status: false, message: "please enter valid token" }) }

        req.userId = checktoken.userId;

        next()
    }
    catch (err) {
        res.status(500).send({ message: err.message });
    }
}


const authorisation = async function (req, res, next) {
    try {
        let token = req.headers["x-api-key"];
        let data = req.params.bookId
        if (mongoose.Types.ObjectId.isValid(data) == false) {
            return res.status(400).send({ status: false, message: "Invalid book id" })
        }
        let decodedToken = jwt.verify(token, "project3-uranium")
        let bookId = req.params.bookId;
        let decoded = decodedToken.userId
        let book = await bookModel.findById(bookId);
        if (!book) {
            return res.status(404).send( {status: false,message:"Book doesn't exist"});
        }
        let Book = book.userId.toString()
        if (Book != decoded) {
            return res.status(403).send({staus:false,message:"Not Authorised!!"})
        }
        next()
    }
    catch (err) {
        return res.status(500).send({ message: err.message });
    }
}


module.exports.authentication = authentication;
module.exports.authorisation = authorisation;