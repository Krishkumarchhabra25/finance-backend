const mongoose  = require("mongoose")
const connectDB = async ()=>{
    try {
        const connect = await  mongoose.connect(process.env.mongodb_DRIVER)
        console.log(`MongoDB Connected ${connect.connection.host}`)
    } catch (error) {
        console.error(`Connection Error: ${error.message}`);
    }
}

module.exports = connectDB