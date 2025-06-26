const mongoose  = require("mongoose");


const TransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    cardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Card'
    },
    type: {
        type: String,
        enum: ['transfer', 'deposit', 'withdrawal', 'payment', 'refund', 'fee'],
        required: true
    },
    category: {
        type: String,
        enum: ['food', 'transport', 'shopping', 'bills', 'entertainment', 'healthcare', 'salary', 'investment', 'other'],
        default: 'other'
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0.01
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'completed'
    },
    merchant: {
        type: String,
        trim: true
    },

}, {timestamps: true});

module.exports = mongoose.model('Transaction', TransactionSchema);
