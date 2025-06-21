const TransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
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
    transactionDate: {
        type: Date,
        default: Date.now,
        index: true
    },
    merchant: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    reference: {
        type: String,
        unique: true
    },
    balanceAfter: {
        type: Number
    }
}, {timestamps: true});

module.exports = mongoose.model('Transaction', TransactionSchema);
