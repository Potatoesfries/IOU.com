import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
        maxLength: 500000
    }
},{timestamps: true})

export default mongoose.model("Note", noteSchema)