const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect('mongodb+srv://akhileshreddy811:8cpbc7TDWUk8Dho0@cluster0.wgoes5e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Schema
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  imageUrl: String, // URL to access uploaded image
});

const Product = mongoose.model('Product', productSchema);

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

// Routes
app.get('/', (req, res) => {
  res.send('Server is running...');
});

// Add product with image
app.post('/api/products/add', upload.single('image'), async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const imageUrl = req.file
      ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
      : '';

    const product = new Product({ name, price, description, imageUrl });
    await product.save();

    res.status(201).json({ message: 'Product added successfully!', product });
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ message: 'Failed to add product.' });
  }
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ _id: -1 });
    res.json(products);
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Server start
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});