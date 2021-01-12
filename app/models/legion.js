const mongoose = require('mongoose')

const legionSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    loyalty: {
        type: String,
        required: true
    },
    homeworld: {
        type: String,
        required: true
    },
    owner: {
      // References user the typew ObjectID
        type: mongoose.Schema.Types.ObjectId,
        // the name of the model to which they refer
        ref: 'User'
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Legion', legionSchema)
