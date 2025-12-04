const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const advertiseOrderRoutes = require("./routes/advertiseOrderRoutes");
const advertiseContentRoutes = require("./routes/advertiseContentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const { MONGODB_URI } = process.env;
if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log("Mongo connected"))
    .catch((err) => console.error(err));
}

app.get('/', (req, res) => res.send('Shob Kisu is running!'));
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/advertise-orders", advertiseOrderRoutes);
app.use("/api/advertise-contents", advertiseContentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
