const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb');

// load environment variable from env file
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());        
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pfdlmml.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

   
    const db = client.db('parcelDB');
    const parcelCollection = db.collection('parcels');
    // const parcelsCollection = client.db('parcelDB').collection('parcels');

    // get to get data
    app.get('/parcels', async(req, res) => {
        const parcels = await parcelCollection.find().toArray();
        res.send(parcels);
    })

    app.get('/parcels', async (req, res) => {
  try {
    const userEmail = req.query.email;

    // If email is provided, filter by created_by; else fetch all
    const query = userEmail ? { created_by: userEmail } : {};

    const options = {
      sort: { createdAt: -1 }, // Sort by newest first
    };

    const parcels = await parcelCollection.find(query, options).toArray();
    res.send(parcels); // ✅ FIXED: res.send, not res,send
  } catch (error) {
    console.error('Error fetching parcels:', error);
    res.status(500).send({ message: 'Failed to get parcels' }); // ✅ FIXED: .send not ._construct
  }
});



    // Post for create anew parcel
    app.post('/parcels', async (req, res) => {
  try {
    const newParcel = req.body;

    // add createdAt timestamp
    // newParcel.createdAt = new Date();

    const result = await parcelCollection.insertOne(newParcel);
    res.status(201).send(result);
  } catch (error) {
    console.error('Error inserting parcel', error);
    res.status(500).send({ message: 'Failed to create parcel' });
  }
});



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



// Basic route
app.get('/', (req, res) => {
  res.send('Hello from Parcel web server!');
});

app.listen(port, () => {
    console.log(`server is listening on port ${port}`);
})
