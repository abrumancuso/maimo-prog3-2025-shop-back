import mongoose from "mongoose";
const { Schema } = mongoose;

const OptionsSchema = new Schema(
  {
    condition: { type: String, enum: ["new", "used"], default: "new", required: true },
    packaging: { type: String, enum: ["vinyl_only", "vinyl_with_box", "box_only"], default: "vinyl_only", required: true },
    protection: { type: Boolean, default: false, required: true },
    giftWrap: { type: Boolean, default: false, required: true }
  },
  { _id: false }
);

const OrderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    basePrice: { type: Number, required: true },
    options: { type: OptionsSchema, required: true },
    unitPrice: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true }
  },
  { _id: false }
);

const CustomerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    zip: { type: String, default: "", trim: true }
  },
  { _id: false }
);

const TotalsSchema = new Schema(
  {
    items: { type: Number, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "ARS" }
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    customer: { type: CustomerSchema, required: true },
    items: { type: [OrderItemSchema], required: true },
    totals: { type: TotalsSchema, required: true },
    status: { type: String, enum: ["pending", "paid", "cancelled"], default: "pending" }
  },
  { timestamps: true }
);

export default mongoose.model("Order", OrderSchema, "Orders");
