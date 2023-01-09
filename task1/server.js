const express = require("express");
const app = express();

const { MongoClient, ServerApiVersion } = require("mongodb");

const username = "admin";
const password = "Prince#97808";
const adminPassword = encodeURIComponent(password);

const url = "mongodb://127.0.0.1:27017";
const database = "userDashBoard";
const coll = "graphCollection";

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

app.listen(8080);
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
  console.log(r);
  res.send({ sccess: true });
});
