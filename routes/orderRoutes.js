const express = require('express');
const { createOrder, getOrder } = require('../controllers/orderController');

const router = express.Router();

router.post('/order', createOrder);
router.get('/order/:id', getOrder);

module.exports = router;
