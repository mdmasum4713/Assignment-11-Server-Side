const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookireParser = require('cookie-parser');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors({
  origin: ['http://localhost:5173','https://profound-genie-072811.netlify.app'],

  credentials: true
}));
app.use(express.json());
app.use(cookireParser());






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mn7xzd7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri)

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
    // await client.connect();
const volunteerCollection = client.db('volunteerDB').collection('volunteer');
const requestCollection = client.db('requestDB').collection('request');

//auth releted api
app.post('/jwt', async(req, res)=>{
  const user = req.body;
  console.log(user);
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '365d'})
  res
  .cookie('token', token,{
    httpOnly: true,
    secure: false, 
    
  })
  .send({success: true})
})



//request releted
app.post('/request', async(req, res) =>{
  const newRequest = req.body;
  console.log(newRequest);
  const result = await requestCollection.insertOne(newRequest);
  res.send(result)
})


app.get('/request', async(req, res) =>{
  const cursor = requestCollection.find();
  const result = await cursor.toArray();
  res.send(result);
})



app.delete('/request/:id', async(req, res) =>{
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await requestCollection.deleteOne(query);
  res.send(result)
  console.log(id)
})


//request end


app.get('/volunteer', async(req, res) =>{
  
  const cursor = volunteerCollection.find();
  const result = await cursor.toArray();
  res.send(result)
})


app.get('/volunteer/:id', async(req, res) =>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await volunteerCollection.findOne(query)
  res.send(result)
})


 app.post('/volunteer', async(req, res)=>{
    const newVolunteer = req.body;
    console.log(newVolunteer);
    const result = await volunteerCollection.insertOne(newVolunteer);
    res.send(result)
 })



 app.put('/volunteer/:id', async(req, res) =>{
  const id = req.params.id;
  const filter = {_id: new ObjectId(id)}
  const options = {upsert: true};
  const updateVolunteer = req.body;
  const volunteer = {
    $set: {
      post: updateVolunteer.post,
       location: updateVolunteer.location,
        date: updateVolunteer.date,
         image: updateVolunteer.image,
          description: updateVolunteer.description,
           category: updateVolunteer.category,
           
    }
  }

  const result = await volunteerCollection.updateOne(filter, volunteer, options);
  res.send(result)

 })




 app.delete('/volunteer/:id', async(req, res) =>{
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await volunteerCollection.deleteOne(query);
  res.send(result)
  console.log(id)
})



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) =>{
    res.send('Volunteer making Server is running')
})

app.listen(port, () =>{
    console.log(`Volunteer Server is running on port:${port}`)
})