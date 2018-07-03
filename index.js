var express = require("express");
var bodyParser = require("body-parser");

var fs = require("fs");

var app = express();
const mongoClient = require("mongodb").MongoClient;

mongoClient.connect(
  "mongodb://localhost:27017/",
  function(err, client) {
    if (err) {
      return console.log(err);
    }
    // взаимодействие с базой данных
    client.close();
  }
);

var jsonParser = bodyParser.json();

app.get("/main", function(request, response) {
  response.send({});
});

app.listen(3000, function() {
  console.log("Сервер ожидает подключения...");
});
