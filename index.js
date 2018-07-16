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

app.get("/main", function(req, res) {
  mongoClient.connect(
    dbURI,
    function(err, client) {
      if (err) {
        res.sendStatus(500);
      }
      client
        .db("blogdb")
        .collection("mainPage")
        .find({})
        .toArray(function(err, mainPageData) {
          if (err) {
            res.sendStatus(500);
          }
          res.send(mainPageData[0]);
          client.close();
        });
    }
  );
});

app.get("/articles/:id", function(request, response) {
  const articleId = request.params["id"];
  console.log(articleId);
  mongoClient.connect(
    dbURI,
    { useNewUrlParser: true },
    function(err, client) {
      if (err) {
        res.sendStatus(500);
      }
      client
        .db("blogdb")
        .collection("articles")
        .findOne({ _id: id }, function(err, data) {
          if (err) {
            res.sendStatus(500);
          }
          console.log(data);
          response.send(data);
          client.close();
        });
    }
  );
});

app.get("/articles", function(request, response) {
  mongoClient.connect(
    dbURI,
    { useNewUrlParser: true },
    function(err, client) {
      if (err) {
        res.sendStatus(500);
      }
      client
        .db("blogdb")
        .collection("articles")
        .find({})
        .toArray(function(err, data) {
          response.send(data);
          client.close();
        });
    }
  );
});

app.post("/article/new", jsonParser, function(request, response) {
  if (!request.body) {
    console.log("error");
    return response.sendStatus(400);
  } else if (!request.body.title && !request.body.text) {
    return response.sendStatus(400);
  }
  const article = { title: request.body.title, text: request.body.text };

  mongoClient.connect(
    dbURI,
    { useNewUrlParser: true },
    function(err, client) {
      client
        .db("blogdb")
        .collection("articles")
        .insertOne(article, function(err, result) {
          if (err) return response.status(400).send();
          console.log(article);
          response.send(JSON.stringify(article));
          client.close();
        });
    }
  );
});

app.post("/logon", jsonParser, function(request, response) {
  if (!request.body) {
    console.log("error");
    return response.sendStatus(400);
  } else if (!request.body.login && !request.body.password) {
    return response.sendStatus(400);
  }
  const credentials = {
    login: request.body.login,
    password: request.body.password
  };

  mongoClient.connect(
    dbURI,
    { useNewUrlParser: true },
    function(err, client) {
      if (err) {
        res.sendStatus(500);
      }
      client
        .db("blogdb")
        .collection("users")
        .findOne({ login: credentials.login }, function(err, result) {
          console.log(result.password + " db");
          console.log(credentials.password + " req");
          if (err) return response.status(400).send();
          if (result.password === credentials.password) {
            response.send(JSON.stringify(credentials));
          } else return response.sendStatus(401);
          client.close();
        });
    }
  );
});

app.post("/register", jsonParser, function(request, response) {
  if (!request.body) {
    console.log("error");
    return response.sendStatus(400);
  } else if (!request.body.login && !request.body.password) {
    console.log(request.body);
    return response.sendStatus(400);
  }
  const credentials = {
    login: request.body.login,
    password: request.body.password
  };

  mongoClient.connect(
    dbURI,
    { useNewUrlParser: true },
    function(err, client) {
      if (err) {
        res.sendStatus(500);
      }
      client
        .db("blogdb")
        .collection("users")
        .findOne({ login: credentials.login }, function(err, result) {
          if (result) {
            console.log(result);
            response.sendStatus(401);
          } else {
            client
              .db("blogdb")
              .collection("users")
              .insertOne(credentials, function(err, result) {
                response.send(JSON.parse(result));
              });
          }
          client.close();
        });
    }
  );
});

app.listen(3000, function() {
  console.log("Сервер ожидает подключения...");
});
