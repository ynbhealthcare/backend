import mongoose from "mongoose";

const skillDepartmentsSchema = new mongoose.Schema(
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

const skillDepartmentsModel = mongoose.model("SkillDepartments", skillDepartmentsSchema);

export default skillDepartmentsModel;
