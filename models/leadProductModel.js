import mongoose from "mongoose";

const  leadProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "Name is required"],
    },

    status: {
      type: Number,
    },
  },
  { timestamps: true }
);

const leadProductModel = mongoose.model("LeadProducts", leadProductSchema);

export default leadProductModel;
