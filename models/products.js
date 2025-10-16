import mongoose from "mongoose";
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name:       { type: String, required: true, trim: true },
    artist:     { type: String, trim: true, default: "" },
    year:       { type: Number, required: true, min: 1700 },
    price:      { type: Number, required: true, min: 0 },
    condition:  { type: String, enum: ["new", "used"], default: "new" },
    packaging:  { type: String, enum: ["vinyl_only","vinyl_with_box","box_only"], default: "vinyl_only" },
    protection: { type: Boolean, default: false },
    giftWrap:   { type: Boolean, default: false },
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema, "Products");
