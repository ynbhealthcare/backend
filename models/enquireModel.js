import mongoose from "mongoose";

const enquireSchema = mongoose.Schema({
  fullname: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  qty: {
    type: Number,
  },
  service: {
    type: String,
  },
},
  { timestamps: true }
);

const enquireModel = mongoose.model('enquire', enquireSchema);

export default enquireModel;