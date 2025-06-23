const mongoose  = require("mongoose");


const AccounSchema = new mongoose.Schema({
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name:{
    type: String,
    required:true,

  },
  type:{
    type:String,
       enum: ['Saving', 'Current', 'Credit', 'Salary', 'NRI', 'PMJDY'],
    required:true
  },
  balances:{
    type:Number ,
    required:true,
    default:0 ,
    min:0
  },
  account_number:{
    type: String  ,
    required:true,
    unique: true
  },
  routing_number:{
    type:String,
    required:true
  },
  isActive:{
    type:Boolean,
    default: true
  },
  currency:{
    type: String,
    default: 'INR'
  }
}, {timestamps:true});

module.exports = mongoose.model('Account', AccounSchema);
