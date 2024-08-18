const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  item: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, required: true, default: 'created' },
}, {
  timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
