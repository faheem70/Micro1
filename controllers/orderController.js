const Order = require('../models/orderModel');
const redisClient = require('../config/redis');
const amqp = require('amqplib');

let channel, connection;

const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URI);
    channel = await connection.createChannel();
    await channel.assertQueue('order.created');
    console.log('Connected to RabbitMQ');
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
  }
};

const createOrder = async (req, res) => {
  const { item, price } = req.body;
  const orderId = require('uuid').v4();

  const order = new Order({ orderId, item, price });
  await order.save();

  redisClient.setex(orderId, 3600, JSON.stringify(order)); // 1 hour TTL
  await channel.sendToQueue('order.created', Buffer.from(JSON.stringify(order)));

  res.json({ message: 'Order created', orderId });
};

const getOrder = async (req, res) => {
  const { id } = req.params;

  redisClient.get(id, async (err, data) => {
    if (data) {
      return res.json(JSON.parse(data));
    } else {
      const order = await Order.findOne({ orderId: id });
      if (order) {
        redisClient.setex(id, 3600, JSON.stringify(order));
        return res.json(order);
      } else {
        return res.status(404).json({ message: 'Order not found' });
      }
    }
  });
};

module.exports = { createOrder, getOrder, connectRabbitMQ };
