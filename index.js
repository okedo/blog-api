const express = require("express");
const bodyParser = require("body-parser");

const fs = require("fs");
const jsonParser = bodyParser.json();

const app = express();
const mongoClient = require("mongodb").MongoClient;
const dbURI = "mongodb://admin:Update01@ds125381.mlab.com:25381/blogdb";
// const dbURI = "mongodb://localhost:27017/";
// const dbURI = "mongodb://okedo:<Update01>@blogdb-shard-00-00-jifjv.mongodb.net:27017,blogdb-shard-00-01-jifjv.mongodb.net:27017,blogdb-shard-00-02-jifjv.mongodb.net:27017/test?ssl=true&replicaSet=BlogDB-shard-0&authSource=admin&retryWrites=true";
// const dbURI = "mongodb://okedo:Update01@blogdb-shard-00-00-jifjv.mongodb.net:27017";
// const dbURI = "mongodb+srv://okedo:<Update01>@blogdb-jifjv.mongodb.net/blogDb";

app.get("/main", function (request, response) {
  mongoClient.connect(
    dbURI, { useNewUrlParser: true }, 
    function (err, client) {
      client.db("blogdb").collection("mainPage").find({}).toArray((mainPageData) => {
        response.send(mainPageData);
        console.log(mainPageData);
        client.close();   
      }, console.log(err));

    }, console.log("something wrong"));
});

app.get("/articles", function (request, response) {
  mongoClient.connect(
    dbURI, { useNewUrlParser: true },
    function (err, client) {
      client.db("blogdb").collection("articles").find({}).toArray((articles) => {
        response.send(articles);
        console.log(articles);
        client.close();
      }, console.log(err));

    }, console.log("something wrong"));
});

app.post("/article/new", jsonParser, function (request, response) {
  if (!request.body) {
    console.log('error');
    return response.sendStatus(400);
  }
  else if (!request.body.title && !request.body.text) {
    return response.sendStatus(500);
  };
  const article = { title: request.body.title, text: request.body.text }

  mongoClient.connect(
    dbURI, { useNewUrlParser: true },
    function (err, client) {
      client.db("blogdb").collection("articles").insertOne(article, function (err, result) {
        if (err) return response.status(400).send();
        response.send(article);
        console.log("data adding");
        client.close();
      });

    }, console.log("something wrong"));
});

app.listen(3000, function () {
  console.log("Сервер ожидает подключения...");
});
