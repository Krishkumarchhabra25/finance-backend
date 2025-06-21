const AanalyticsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    category: {
        type: String,
        required: true,
        enum: ['food', 'transport', 'shopping', 'bills', 'entertainment', 'healthcare', 'other']
    },
    budgetAmount: {
        type: Number,
        required: true,
        min: 0
    },
    spentAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    alertThreshold: {
        type: Number,
        default: 80  // Alert when 80% of budget is spent
    }
}, {timestamps: true});

module.exports = mongoose.model('Aanalytics', AanalyticsSchema);


/* const GoalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    targetAmount: {
        type: Number,
        required: true,
        min: 0.01
    },
    currentAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    targetDate: {
        type: Date,
        required: true
    },
    category: {
        type: String,
        enum: ['savings', 'investment', 'debt', 'purchase', 'emergency', 'other'],
        default: 'savings'
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'paused', 'cancelled'],
        default: 'active'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    }
}, {timestamps: true});
 */
// Used in: Analytics (primary), Dashboard (savings goal display)
// Navigation: /analytics, / (dashboard stats)
