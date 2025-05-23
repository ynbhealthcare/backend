import mongoose from "mongoose";

const attributeDepartmentsSchema = new mongoose.Schema(
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

const attributeDepartmentsModel = mongoose.model("AttributeDepartments", attributeDepartmentsSchema);

export default attributeDepartmentsModel;
