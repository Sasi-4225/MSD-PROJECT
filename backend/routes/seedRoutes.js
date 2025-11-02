import express from 'express';
import Product from '../models/productModel.js';
import data from '../data.js';
import User from '../models/userModel.js';

const seedRouter = express.Router();

seedRouter.get('/', async (req, res) => {
  try {
    // ✅ Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});

    // ✅ Insert fresh data
    const createdProducts = await Product.insertMany(data.products);
    const createdUsers = await User.insertMany(data.users);

    res.send({
      message: 'Database Seeded',
      createdProducts,
      createdUsers,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

export default seedRouter;
