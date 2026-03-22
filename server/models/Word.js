const mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
    id: { 
        type: String, 
        required: true, 
        unique: true 
    },
    type: { 
        type: String, 
        default: 'word' 
    },
    front: { 
        type: String, 
        required: true 
    },
    back: { 
        type: String, 
        required: true 
    },
    bucket: { 
        type: Number, 
        default: 1 
    },
    starred: { 
        type: Boolean, 
        default: false 
    },
    listId: { 
        type: String, 
        required: true 
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Word', wordSchema);