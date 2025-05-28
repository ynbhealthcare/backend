import mongoose from "mongoose";

const orderSchema = mongoose.Schema({
  items: {
    type: Array,
    required: [true, "items is required"],
  },
  status: {
    type: Number,
  },
  mode: {
    type: String,
  },
  details: {
    type: Array,
  },
  discount: {
    type: Number,
  },
  shipping: {
    type: Number,
  },
  applyIGST: {
    type: Number,
  },
  applyCGST: {
    type: Number,
  },
  applySGST: {
    type: Number,
  },
  subtotal: {
    type: Number,
  },
  taxTotal: {
    type: Number,
  },
  totalAmount: {
    required: [true, "Total Amount is required"],
    type: Number,
  },
  userId: {  // Changed field name to plural and set type as an array of ObjectIds
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  primary: {
    type: String,
  }, payment: {
    type: Number,
    default: 0,
  },
  orderId: {
    type: Number,
  },
  AdvanceAmt: {
    type: Number,
  },
  SecurityAmt: {
    type: Number,
  },
  reason: {
    type: String,
  },
  comment: {
    type: String,
  },
  type: {
    type: Number,
    default: 0,
  },
   
  UserDetails: {
    type: Array,
  },
  addProduct: {
    type: Array,
  },
  addReceived: {
    type: Array,
  },
  addRental: {
    type: Array,
  },
  addReturn: {
    type: Array,
  },
  addHistory: {
    type: Array,
  },
  PickupDate: {
    type: Date,
  },
  ReturnDate: {
    type: Date,
  },
  OnBoardDate: {
    type: Date,
  },
  dutyHr: {
    type: Number,
  },
  
  employeeSaleId: {  // Changed field name to plural and set type as an array of ObjectIds
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  employeeId: {  // Changed field name to plural and set type as an array of ObjectIds
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
},
  { timestamps: true }
);

const orderModel = mongoose.model('Order', orderSchema);

export default orderModel;
