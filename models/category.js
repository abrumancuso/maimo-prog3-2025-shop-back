import mongoose from "mongoose";
const { Schema } = mongoose;

const categorySchema = new Schema({

    name: {type: String, required: true, trim: true},
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    }
});

export default mongoose.model("Category", categorySchema, "Categories");