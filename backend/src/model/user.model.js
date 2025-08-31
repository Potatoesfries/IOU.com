// import mongoose to create schema for user model
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({

    // user full name
    fullName:{
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    // image user for their profile
    imageUrl:{
        type: String,
        required: true,
    },
    // clerkId for user Id that we got after clerk does the authentication
    clerkId:{
        type: String,
        required: true,
        unique: true,
    },
    // email for when user want to log in with their email
    email:{
        type: String,
        sparse: true,
        index: true
    }   

    // timestamp for when the user was created and updated
},{timestamps: true});
// exporting the user model
export const User = mongoose.model('User', userSchema);