const jwt = require("jsonwebtoken");
const bookModel = require("../models/booksModel");

const authentication=function(req,res,next){
    try {
        // getting token from req(header)
        let token = req.headers["x-api-key"];
        if (!token) token = req.headers["X-Api-Key"];
        if (!token) {
            return res.status(400).send({ Error: "Enter x-api-key In Header" });
        }

        // token verification
        let checktoken = jwt.verify(token, "project3-uranium",function(err,decode){
            if (err) return res.status(401).send({msg:"please enter valid token"})
            next()
        });
      
    }
    catch (err) {
        res.status(500).send({ msg: err.message });
    }
}


const authorisation = async function (req, res, next) {
  let token = req.headers["x-Api-key"] || req.headers["x-api-key"];

 let decodedtoken = jwt.verify(token, "project3-uranium");
 let userLoggedIn = decodedtoken.userId;

 let userIdFound= await bookModel.findOne({userId : userLoggedIn}).select({_id : 0 , userId:1})
  if (!userIdFound) {
    return res.status(404).send({ status: false, data: "user did not create blog" });
  } // user exist but not created book. Here we are checking book Id from user id.
  req["userId"]= decodedtoken.userId
  next();
}


module.exports.authentication = authentication;
module.exports.authorisation = authorisation;