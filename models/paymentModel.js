import mongoose from "mongoose";

const paymentSchema = mongoose.Schema(
  {
    paymentId: {
      type: Number,
    },
    razorpay_order_id: {
      type: String,
    },

    razorpay_payment_id: {
      type: String,
    },

    razorpay_signature: {
      type: String,
    },
    note: {
      type: String,
    },

    totalAmount: {
      required: [true, "Total Amount is required"],
      type: Number,
    },

    userId: {
      // Changed field name to plural and set type as an array of ObjectIds
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    planId: {
      // Changed field name to plural and set type as an array of ObjectIds
      type: mongoose.Schema.Types.ObjectId,
      ref: "plan",
      required: true,
    },
    payment: {
      type: Number,
      default: 0,
    },

    paymentConfirm: {
      type: Number,
      default: 0,
    },
    Local: {
      type: Number,
    },
  },
  { timestamps: true }
);

const paymentModel = mongoose.model("payment", paymentSchema);

export default paymentModel;
