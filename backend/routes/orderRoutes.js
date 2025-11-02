import express from 'express';
import pdfKit from 'pdfkit';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import { isAuth, isAdmin, mailgun, payOrderEmailTemplate } from '../utils.js';

const orderRouter = express.Router();

/* ✅ Get all orders (Admin only) */
orderRouter.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find().populate('user', 'name');
    res.send(orders);
  })
);

/* ✅ Create new order */
orderRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const newOrder = new Order({
      orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      itemsPrice: req.body.itemsPrice,
      shippingPrice: req.body.shippingPrice,
      DiscountPrice: req.body.DiscountPrice,
      totalPrice: req.body.totalPrice,
      user: req.user._id,
    });

    const order = await newOrder.save();
    res.status(201).send({ message: 'New Order Created', order });
  })
);

/* ✅ Summary for Admin */
orderRouter.get(
  '/summary',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.aggregate([
      { $group: { _id: null, numOrders: { $sum: 1 }, totalSales: { $sum: '$totalPrice' } } },
    ]);
    const users = await User.aggregate([{ $group: { _id: null, numUsers: { $sum: 1 } } }]);
    const dailyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const productCategories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    res.send({ users, orders, dailyOrders, productCategories });
  })
);

/* ✅ Get orders of logged-in user (Order History) */
orderRouter.get(
  '/mine',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).populate('orderItems.product');
    res.send(orders);
  })
);

/* ✅ PDF Report */
orderRouter.get(
  '/:id/report',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
      .populate('user')
      .populate('orderItems.product');

    if (!order) {
      return res.status(404).send({ message: 'Order Not Found' });
    }

    const doc = new pdfKit();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=OrderReport_${order._id}.pdf`);

    doc.pipe(res);

    doc.fontSize(16).text(`Order Report`, { underline: true });
    doc.moveDown();

    doc.fontSize(12).text(`Order ID: ${order._id}`);
    doc.text(`Date: ${order.createdAt.toDateString()}`);
    doc.text(`Customer: ${order.user.name}`);
    doc.text(`Email: ${order.user.email}`);
    doc.moveDown();

    doc.text(`Shipping Address:`);
    doc.text(`  ${order.shippingAddress.fullName}`);
    doc.text(`  ${order.shippingAddress.address}`);
    doc.text(`  ${order.shippingAddress.city}`);
    doc.text(`  ${order.shippingAddress.postalCode}`);
    doc.text(`  ${order.shippingAddress.country}`);
    doc.moveDown();

    doc.text(`Ordered Items:`);
    let total = 0;

    order.orderItems.forEach((item, i) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;

      doc.text(
        `${i + 1}. ${item.product?.name || 'Unknown Product'} — ${item.quantity} × ₹${item.price} = ₹${itemTotal}`
      );
    });
    doc.moveDown();

    const discount = (total * 10) / 100;
    const delivery = 10;

    doc.text(`Subtotal: ₹${total}`);
    doc.text(`Discount (10%): -₹${discount}`);
    doc.text(`Delivery: ₹${delivery}`);
    doc.text(`Final Total: ₹${total - discount + delivery}`);

    doc.end();
  })
);

/* ✅ Get order by ID */
orderRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('orderItems.product');
    if (!order) return res.status(404).send({ message: 'Order Not Found' });
    res.send(order);
  })
);

/* ✅ Mark Delivered */
orderRouter.put(
  '/:id/deliver',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).send({ message: 'Order Not Found' });

    order.isDelivered = true;
    order.deliveredAt = Date.now();

    await order.save();
    res.send({ message: 'Order Delivered' });
  })
);

/* ✅ Mark Paid */
orderRouter.put(
  '/:id/pay',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'email name');

    if (!order) return res.status(404).send({ message: 'Order Not Found' });

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = req.body;

    const updatedOrder = await order.save();

    // send email
    try {
      await mailgun().messages().send({
        from: 'foodie <orders@mg.yourdomain.com>',
        to: `${order.user.name} <${order.user.email}>`,
        subject: `Order ${order._id} Paid`,
        html: payOrderEmailTemplate(order),
      });
    } catch (err) {
      console.log(err);
    }

    res.send({ message: 'Order Paid', order: updatedOrder });
  })
);

/* ✅ Delete order */
orderRouter.delete(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).send({ message: 'Order Not Found' });

    if (!order.user.equals(req.user._id) && !req.user.isAdmin) {
      return res.status(403).send({ message: 'Not allowed to delete this order' });
    }

    await order.remove();
    res.send({ message: 'Order Deleted' });
  })
);

export default orderRouter;
