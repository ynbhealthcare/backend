import mongoose from "mongoose";

const consultationSchema = mongoose.Schema({
  fullname: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  requirement : {
    type: String,
  },
},
  { timestamps: true }
);

const consultationModel = mongoose.model('consultation', consultationSchema);

export default consultationModel;
