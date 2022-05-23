const mongoose = require('mongoose');
const ObjectId=mongoose.Schema.Types.ObjectId
const moment=require('moment')

const booksSchema = new mongoose.Schema( { 
    title: {type:String, required:true, unique:true,trim:true},
    bookCover:{type:String},
    excerpt: {type:String, required:true}, 
    userId: {type:ObjectId, required:true, ref:'User'},
    ISBN: {type:String, required:true, unique:true},
    category: {type:String, required:true},
    subcategory:[{type:String,required:true}],
    reviews: {type:Number, default: 0},
    deletedAt: {type:String}, 
    isDeleted: {type:Boolean, default: false},
    releasedAt: {type:Date, required:true}
  }
,{ timestamps: true });

module.exports = mongoose.model('Book', booksSchema) 