const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const cors = require("cors")

const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l9l3g.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri)
async function run() {

    try {
        await client.connect();
        const database = client.db("bikeBazar")
        const productsCollection = database.collection('products')
        const ordersCollection = database.collection('orders')
        const usersCollection = database.collection('users')
        const reviewCollection = database.collection('review')
        console.log("database connected successfully")

        //Post API   
        app.post("/addProducts", async (req, res) => {
            const result = await productsCollection.insertOne(req.body)
            res.send(result);

        })

        // get api  
        app.get("/allProducts", async (req, res) => {
            const products = await productsCollection.find({}).toArray();
            res.send(products)
        })

        // get single Product
        app.get("/singleProduct/:id", async (req, res) => {
            const result = await productsCollection.find({ _id: ObjectId(req.params.id) }).toArray();
            res.send(result[0])
        })

        // order place  
        app.post("/orderPlace", async (req, res) => {
            const result = await ordersCollection.insertOne(req.body)
            res.send(result)

        })

        // get my order  
        app.get("/myOrder", async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = ordersCollection.find()
            const order = await cursor.toArray();
            res.send(order);

        })

        app.post('/users', async (req, res) => {
            const result = await usersCollection.insertOne(req.body);
            res.send(result)
        })

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log(user)
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.send(result)
        })


        // check admin                   
        app.get("/users/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;

            if (user && user?.role === 'admin') {
                isAdmin = true;
            }
            res.send({ admin: isAdmin });

        })



        // review section 
        app.post("/review", async (req, res) => {
            const result = await reviewCollection.insertOne(req.body)
            res.send(result);

        })

        // ge review 
        app.get("/review", async (req, res) => {
            const products = await reviewCollection.find({}).toArray();
            res.send(products)
        })



        // get all orders    
        app.get("/allOrders", async (req, res) => {
            const orders = await ordersCollection.find({}).toArray();
            res.send(orders)

        })

        // status update all orders
        app.put("/statusUpdate/:id", async (req, res) => {
            const filter = { _id: ObjectId(req.params.id) };
            console.log(req.params.id);
            const result = await ordersCollection.updateOne(filter, {
                $set: { status: req.body.status },
            });
            res.send(result);
            console.log(result);
        });

        // delete   
        app.delete("/deleteProduct/:id", async (req, res) => {
            const result = await productsCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            res.send(result);
        });

    }

    finally {
        // await client.close();
    }
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send("Hello mongodb")
})



app.listen(port, (req, res) => {
    console.log('server running with port', port)
})