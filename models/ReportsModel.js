const ReportConfigSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reportType: {
        type: String,
        enum: ['financial-summary', 'spending-analysis', 'income-report', 'tax-report'],
        required: true
    },
    frequency: {
        type: String,
        enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
        default: 'monthly'
    },
    autoGenerate: {
        type: Boolean,
        default: false
    },
    emailDelivery: {
        type: Boolean,
        default: false
    },
    lastGenerated: {
        type: Date
    }
}, {timestamps: true});





module.exports = mongoose.model('Reports', ReportConfigSchema);
