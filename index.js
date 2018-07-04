var express = require("express");
var bodyParser = require("body-parser");

var fs = require("fs");

var app = express();
const mongoClient = require("mongodb").MongoClient;

mongoClient.connect(
  "mongodb://localhost:27017/",
  function (err, client) {
    const db = client.db("blogDb");
    const collection = db.collection("articles");
    let user = { name: "Tom", age: 23 };
    collection.insertOne(user, function (err, result) {

      if (err) {
        return console.log(err);
      }
      console.log(result.ops);
      client.close();
    })
  })

var jsonParser = bodyParser.json();

app.get("/main", function (request, response) {
  console.log("ok");
  response.send({"sdd":"sdad"});
});

app.listen(3000, function () {
  console.log("Сервер ожидает подключения...");
});
