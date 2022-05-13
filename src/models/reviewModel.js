const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

const reviewSchema = new mongoose.Schema({

    bookId: { type: ObjectId, ref: 'Book', },
    reviewedBy: { type: String, default: 'Guest' },
    reviewedAt: { type:String, default:new Date().toLocaleString() },
    rating: { type: Number, min: 1, max: 10, required: true },
    review: { type: String },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('Review', reviewSchema)