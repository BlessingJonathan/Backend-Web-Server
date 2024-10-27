
 require("dotenv").config();
const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
const PORT = process.env.PORT || 3001;
const cors = require("cors")
//const { authenticateUser } = require('auth');
const bodyParser = require('body-parser');
const uri = process.env.MDB_CONNECTION_STRING

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());


let db; // Global variable to hold the database connection
let client;
// Connect to MongoDB and set up the database
function connectToMongo() {
  client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  return client.connect()
      .then(() => {
          db = client.db("ThewriteInkco"); // Database name
          console.log('Connected to MongoDB');
      })
      .catch(error => {
          console.log('Failed to connect to MongoDB:', error.message);
          process.exit(1); // Exit the process if unable to connect to MongoDB
      });
}

// Invoke the function

// API endpoint for user signup
app.post("/signup", async (req, res) => {
  try {
    const user = req.body;

    if (user.password.length < 6) throw new Error("Password too short");
    if (!user.email.includes("@")) throw new Error("Invalid email format");


    const collection = db.collection("Customers");

    const existingUser = await collection.findOne({ email: user.email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const result = await collection.insertOne({
      ...user,
      createdAt: new Date(),
    });

    res.status(201).json({
      message: "User created successfully",
      userId: result.insertedId,
    });
  } catch (error) {
    console.error("Error inserting user: ", error);
    res.status(500).json({ message: error.message || `Internal Server Error: ${error}`});
  }
});
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authenticateUser(email, password);
    res.json({ message: 'Login successful', user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
app.get('/getproducts', async (req, res) => {
  try {
      try {
        await client.connect();
        const database = client.db('ThewriteInkco'); 
        const productsCollection = database.collection('Products Catalogue'); 

        const products = await productsCollection.find().toArray();
        res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});
app.get('/customers', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('ThewriteInkco'); 
        const usersCollection = database.collection('Customers'); 

        const users = await usersCollection.find().toArray();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    } 
});

app.get('/orders', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('ThewriteInkco'); 
        const orderCollection = database.collection('Cart'); 

        const orderItems = await orderCollection.find().toArray();
        res.json(orderItems);
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    } 
});



app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
connectToMongo();
  
