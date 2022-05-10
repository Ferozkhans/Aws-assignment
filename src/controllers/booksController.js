const userModel = require("../models/userModel")
const booksModel = require("../models/booksModel")
const jwt = require("jsonwebtoken");

const createBook = async function (req, res) {
  try {
   let data = req.body
    let arr = Object.keys(data)
    if (arr.length == 0){
       return res.status(400).send({ msg: "Data is empty. Please provide details" })
      }

    let validUsers=await userModel.findOne({_id:data.userId})
    if(!validUsers) return res.status(404).send({status:false, msg:"User Not Found"})
    if(!data.title) return res.status(400).send({status:false,msg:"Title is required!"})
    let sameTitle=await booksModel.findOne({title:data.title})
    if(sameTitle) return res.status(400).send({status:false,msg:"Title already exist"})

    if(!data.excerpt) return res.status(400).send({status:false,msg:"excerpt is required!"})
    if(!data.ISBN) return res.status(400).send({status:false,msg:"ISBN is required!"})
    let sameISBN=await booksModel.findOne({ISBN:data.ISBN})
    if(sameISBN) return res.status(400).send({status:false,msg:"ISBN already exist"})
    if(!data.category) return res.status(400).send({status:false,msg:"category is required!"})
    if(!data.subcategory) return res.status(400).send({status:false,msg:"subcategory is required!"})
    if(!data.releasedAt) return res.status(400).send({status:false,msg:"provide release Date"})

    if(typeof(data.title)!= "string") return res.status(400).send({status:false,msg:"title must be string"})
    let title = /^[a-zA-Z0-9 ]{2,30}$/.test(data.title);
    let excerpt = /^[a-zA-Z0-9 ]{2,300}$/.test(data.excerpt);
    let ISBN = /^[0-9-]{14}$/.test(data.ISBN);
    let category = /^[a-zA-Z ]{2,30}$/.test(data.category);
    // let subcategory = /^[a-zA-Z]{2,300}$/.test(data.subcategory);
    let reviews= /^[0-9 ]{1,30}$/.test(data.reviews);
    let releasedAt= /^\d{4}-\d{2}-\d{2}$/.test(data.releasedAt);

    if(!title) return res.status(400).send({status:false,msg:"Enter valid title"})
    if(!excerpt) return res.status(400).send({status:false,msg:"Enter valid excerpt"})
    if(!ISBN) return res.status(400).send({status:false,msg:"Enter valid ISBN"})
    if(!category) return res.status(400).send({status:false,msg:"Enter valid category"})
    // if(!subcategory) return res.status(400).send({status:false,msg:"Enter valid subcategory"})
    if(!reviews) return res.status(400).send({status:false,msg:"Enter numbers only"})
    if(!releasedAt) return res.status(400).send({status:false,msg:"Enter valid date format yyyy-mm-dd"})

    if (data.isDeleted === true) {
        data.deletedAt = new Date().toLocaleString()
      }
  
    

    let books=await booksModel.create(data)
    return res.status(201).send({status:true, data:books})
} catch (err) {
    res.status(500).send({ Error: "Server not responding", error: err.message });
  }
}

module.exports.createBook=createBook
