const mongoose  = require("mongoose");
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
    email:{
        type:String,
        required: true,
        unique:true
    },
    password:{
        type:String
    },
    name: {
        type: String , 
        require: true
    },
    avatar:{
        type: String
    },
    provider:{
        type: String ,
        enum: ['local' , 'google' , 'github' , 'facebook'],
        default: 'local'
    },
     lastLogin: {
        type: Date,
        default: Date.now
    }

} , {timestamps: true}
);
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.pre("save" , async function (next) {
    if(!this.isModified("password")){
        return next()
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password , salt);
        return next()
    } catch (error) {
        return next(err)
    }
})

module.exports = mongoose.model('User', UserSchema);
