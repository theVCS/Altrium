const express = require("express");
const app = express();

const { MongoClient, ServerApiVersion } = require("mongodb");

require("dotenv").config();

const username = process.env.USER;
const password = process.env.PASSWORD;
const adminPassword = encodeURIComponent(password);

const database = "userDashBoard";
const coll = "graphCollection";
// console.log(username)
// console.log(password)
const uri = `mongodb+srv://${username}:${adminPassword}@cluster1.sjhpbbx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function dbConnect() {
  let result = await client.connect();
  let db = result.db(database);
  return db.collection(coll);
}

app.listen(8080, function () {
  console.log("callback function");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "Content-Type",
    "Authorization"
  );
  next();
});

app.post("/", (req, res) => {
  const len = req.body.length;
  const y = Array.from({ length: len }, () => Math.floor(Math.random() * 40));
  let x = new Array();

  for (let index = 1; index <= len; index++) x.push(index);

  res.send({ x: x, y: y });
});

app.post("/getData", async (req, res) => {
  const db = await dbConnect();
  const data = await db.find().toArray();
  let metaData = [];
  let gridData = [];

  for (const item of data) {
    gridData.push({
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      content: item.content,
    });

    metaData.push({
      id: item.id,
      type: item.type,
    });
  }

  res.send({ gridData: gridData, metaData: metaData });
});

app.post("/saveConfig", async (req, res) => {
  const data = req.body.data;
  const db = await dbConnect();
  let r = "";
  r = await db.deleteMany({});
  console.log(r);
  r = await db.insertMany(data);
  res.send({ sccess: true });
});
