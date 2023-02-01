const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const Schema = mongoose.Schema;
mongoose.set('strictQuery', true);

const GraphSchema = new Schema({
  x: String,
  y: String,
  w: String,
  h: String,
  id: String,
  content: String,
  type: String,
  row: String,
  col: String,
});

const grpModel = mongoose.model('graph', GraphSchema)

const username = process.env.USER;
const password = process.env.PASSWORD;
const adminPassword = encodeURIComponent(password);
const database = "userDashBoard";
const coll = "graphCollection";
const uri = `mongodb+srv://${username}:${adminPassword}@cluster1.sjhpbbx.mongodb.net/?retryWrites=true&w=majority`;
mongoose.connect(uri).then(() => console.log("Connected!"));


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
  const data = await grpModel.find();
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
      row: item.row,
      col: item.col,
    });
  }

  res.send({ gridData: gridData, metaData: metaData });
});

app.post("/saveConfig", async (req, res) => {
  const data = req.body.data;
  // console.log(data);

  let r = "";
  r = await grpModel.deleteMany({});

  if(data!=undefined)
  for(const d of data)
  {
    r = new grpModel(d);
    let result = await r.save();
  }

  res.send({ sccess: true });
});
