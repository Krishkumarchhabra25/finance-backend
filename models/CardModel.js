const mongoose  = require("mongoose");


const CardSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },
    accountId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Account',
        required:true
    },
    name:{
        type:String ,
        required: true
    },
     type: {
    type: String,
    enum: [
      'Debit Card',
      'Credit Card',
      'ATM Card',
      'RuPay Card',
      'Prepaid Card',
      'Forex Card',
      'Business Credit Card'
    ],
    required: true,
  },
    holderName:{
        type:String,
        required:true
    },
    cardNumber:{
        type:String ,
        required:true
    },
    lastFourDigits:{
        type:String ,
        required: true
    },
    expiryMonth:{
        type:String,
        required: true,
        min:1 ,
        max:12
    },
      expiryYear: {
        type: String,
        required: true
    },
    cvv: {
        type: String,
        required: true  // Store encrypted
    },
    creditLimit: {
        type: Number,
        required: true,
        min: 0
    },
        currentBalance: {
        type: Number,
        required: true,
        default: 0  // Outstanding debt
    },
    availableCredit: {
        type: Number,
        default: function() {
            return this.creditLimit - this.currentBalance;
        }
    },
    interestRate: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },

} , {timestamps:true})

module.exports = mongoose.model('Card', CardSchema);
