import mongoose from "mongoose";

const redeemSchema = new mongoose.Schema(
  {
    redeemId: {
      type: Number,
      unique: true,
    },
    note: {
      type: String,
    },
    totalAmount: {
      required: [true, "Total Amount is required"],
      type: Number,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    confirm: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Pre-save hook for auto-increment redeemId
redeemSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const lastDoc = await mongoose.model("redeem").findOne().sort({ redeemId: -1 });
      this.redeemId = lastDoc ? lastDoc.redeemId + 1 : 1;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

const redeemModel = mongoose.model("redeem", redeemSchema);
export default redeemModel;
