const express = require("express");
const bodyParser = require("body-parser");
const objectId = require("mongodb").ObjectID;
const fs = require("fs");
const jsonParser = bodyParser.json();

const app = express();
const mongoClient = require("mongodb").MongoClient;
const dbURI = "mongodb://admin:Update01@ds125381.mlab.com:25381/blogdb";
// const dbURI = "mongodb://<admin>:<Update01>@ds125381.mlab.com:25381/blogdb";
// const dbURI = "mongodb://localhost:27017/";
// const dbURI = "mongodb://okedo:<Update01>@blogdb-shard-00-00-jifjv.mongodb.net:27017,blogdb-shard-00-01-jifjv.mongodb.net:27017,blogdb-shard-00-02-jifjv.mongodb.net:27017/test?ssl=true&replicaSet=BlogDB-shard-0&authSource=admin&retryWrites=true";
// const dbURI = "mongodb://okedo:Update01@blogdb-shard-00-00-jifjv.mongodb.net:27017";
// const dbURI = "mongodb+srv://okedo:<Update01>@blogdb-jifjv.mongodb.net/blogDb";

app.get("/main", function(req, res) {
  mongoClient.connect(
    dbURI,
    function(err, client) {
      if (err) {
        console.log(err);
        return;
      }
      client
        .db("blogdb")
        .collection("mainPage")
        .find({})
        .toArray(function(err, mainPageData) {
          res.send(mainPageData[0]);
          client.close();
        });
    }
  );
});

app.get("/articles/:id", function(request, response) {
  const articleId = new objectId(request.params["id"]);
  console.log(articleId);
  mongoClient.connect(
    dbURI,
    function(err, client) {
      if (err) {
        console.log(err);
        return;
      }
      client
        .db("blogdb")
        .collection("articles")
        .findOne({ _id: articleId }, function(err, data) {
          if (err) {
            console.log(err);
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
        console.log(err);
        return;
      }
      client
        .db("blogdb")
        .collection("articles")
        .find(
          {},
          {
            _id: 1,
            title: 1,
            text: 1,
            userId: 1
          }
        )
        .toArray(function(err, data) {
          // console.log(data);
          response.send(data);
          client.close();
        });
    }
  );
});

app.post("/articles/new", jsonParser, function(request, response) {
  if (!request.body) {
    console.log("error");
    return response.sendStatus(400);
  } else if (
    !request.body.userId ||
    (!request.body.title && !request.body.text)
  ) {
    return response.sendStatus(400);
  }
  const article = {
    userId: request.body.userId,
    title: request.body.title,
    text: request.body.text
  };

  mongoClient.connect(
    dbURI,
    { useNewUrlParser: true },
    function(err, client) {
      if (err) {
        console.log(err);
        return;
      }
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

app.post("/articles/remove/", jsonParser, function(request, response) {
  console.log(request.body);
  if (!request.body) {
    console.log("error");
    return response.sendStatus(400);
  } else if (!request.body.id) {
    return response.sendStatus(400);
  }
  const articleId = new objectId(request.body.id);

  mongoClient.connect(
    dbURI,
    { useNewUrlParser: true },
    function(err, client) {
      if (err) {
        console.log(err);
        return;
      }
      client
        .db("blogdb")
        .collection("articles")
        .remove({ _id: articleId }, true);

      client
        .db("blogdb")
        .collection("articles")
        .find(
          {},
          {
            _id: 1,
            title: 1,
            text: 1
          }
        )
        .toArray(function(err, data) {
          // console.log(data);
          response.send(data);
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
        console.log(err);
        return;
      }
      client
        .db("blogdb")
        .collection("users")
        .findOne({ login: credentials.login }, function(err, result) {
          console.log(result.password + " db");
          console.log(credentials.password + " req");
          if (err) return response.status(400).send();
          if (result.password === credentials.password) {
            const responseData = {
              id: result._id,
              login: result.login
            };
            response.send(JSON.stringify(responseData));
          } else return response.status(401).send();
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
        console.log(err);
        return;
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
