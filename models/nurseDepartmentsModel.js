import mongoose from "mongoose";

const nurseDepartmentsSchema = new mongoose.Schema(
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

const nurseDepartmentsModel = mongoose.model("NurseDepartments", nurseDepartmentsSchema);

export default nurseDepartmentsModel;
