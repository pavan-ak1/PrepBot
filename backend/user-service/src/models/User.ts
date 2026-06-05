import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        unique:[true, "Username already exists"],
        required:true,
    },
    email:{
        type:String,
        unique:[true, "Email already exists"],
        required:true,  
    },
    password:{
        type:String,
        required:true,

    }
})

export const userModel = mongoose.model("users", UserSchema);

