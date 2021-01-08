const mongoose = require('mongoose')

const legionSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    number: {
        type: String,
        required: true
    },
    homeworld: {
        type: String,
        required: true
    },
    primarch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Venue', venueSchema)
