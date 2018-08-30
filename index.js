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

function logError(error) {
  const errorData = {
    errorInfo: error instanceof Error ? error.toString() : error,
    date: new Date()
  };
  mongoClient.connect(
    dbURI,
    { useNewUrlParser: true },
    function(err, client) {
      client
        .db("blogdb")
        .collection("errors")
        .insertOne(errorData);
      client.close();
    }
  );
}

function generateToken(n) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = "";
  for (let i = 0; i < n; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

app.get("/main", function(req, res) {
  mongoClient.connect(
    dbURI,
    function(err, client) {
      if (err) {
        logErr(err);
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
  let articleId = "";
  try {
    articleId = new objectId(request.params["id"]);
  } catch (error) {
    logError(error);
    return response.status(500).send();
  }
  mongoClient.connect(
    dbURI,
    function(err, client) {
      if (err) {
        logErr(err);
        return;
      }
      client
        .db("blogdb")
        .collection("articles")
        .findOne(
          { _id: articleId },
          { userId: 1, title: 1, text: 1, description: 1, _id: 1 },
          function(err, data) {
            if (err) {
              logErr(err);
            }
            response.send(data);
            client.close();
          }
        );
    }
  );
});

app.get("/articles", function(request, response) {
  mongoClient.connect(
    dbURI,
    { useNewUrlParser: true },
    function(err, client) {
      if (err) {
        logErr(err);
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
            description: 1,
            userId: 1
          }
        )
        .toArray(function(err, data) {
          response.send(data);
          client.close();
        });
    }
  );
});

app.post("/articles/update", jsonParser, function(request, response) {
  if (!request.body) {
    logError("empty request body");
    return response.sendStatus(400);
  } else if (
    !request.body._id ||
    !request.body.userId ||
    !request.body.title ||
    !request.body.text ||
    !request.body.description
  ) {
    logError("wrong request");
    return response.sendStatus(400);
  }
  const articleId = new objectId(request.body._id);
  const article = {
    title: request.body.title,
    text: request.body.text,
    description: request.body.description
  };

  mongoClient.connect(
    dbURI,
    { useNewUrlParser: true },
    function(err, client) {
      if (err) {
        logErr(err);
        return;
      }
      client
        .db("blogdb")
        .collection("articles")
        .findOneAndUpdate(
          { _id: articleId },
          {
            $set: {
              title: article.title,
              text: article.text,
              description: article.description
            }
          },
          function(err, result) {
            if (err) {
              logErr(err);
              return response.status(400).send();
            }
            response.send(JSON.stringify(result.value._id));
            client.close();
          }
        );
    }
  );
});

app.post("/articles/new", jsonParser, function(request, response) {
  if (!request.body) {
    logError("empty request body");
    return response.sendStatus(400);
  } else if (
    !request.body.userId ||
    !request.body.title ||
    !request.body.text ||
    !request.body.description
  ) {
    logError("wrong request");
    return response.sendStatus(400);
  }
  const article = {
    userId: request.body.userId,
    title: request.body.title,
    text: request.body.text,
    description: request.body.description
  };

  mongoClient.connect(
    dbURI,
    { useNewUrlParser: true },
    function(err, client) {
      if (err) {
        logErr(err);
        return;
      }

      client
        .db("blogdb")
        .collection("articles")
        .insertOne(article, function(err, result) {
          if (err) {
            logErr(err);
            return response.status(400).send();
          }
          response.send(JSON.stringify(result.ops[0]._id));
          client.close();
        });
    }
  );
});

app.post("/articles/remove/", jsonParser, function(request, response) {
  if (!request.body) {
    logError("empty request body");
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
        logErr(err);
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
          response.send(data);
          client.close();
        });
    }
  );
});

app.post("/refresh", jsonParser, function(request, response) {
  if (!request.body) {
    logError("empty request body");
    return response.sendStatus(400);
  } else if (!request.body.userToken) {
    logError("POST /refresh - invalid user token");
    return response.sendStatus(400);
  }
  mongoClient.connect(
    dbURI,
    { useNewUrlParser: true },
    function(err, client) {
      if (err) {
        logErr(err);
        return;
      }
      client
        .db("blogdb")
        .collection("users")
        .findOneAndUpdate(
          { userToken: request.body.userToken },
          { $set: { userToken: generateToken(12) } },
          {
            projection: { userToken: 1, userId: 1, login: 1 },
            returnOriginal: false
          },
          function(err, result) {
            if (err) {
              logError(err);
              return response.status(403).send();
            }
            const userData = {
              id: result.value._id,
              login: result.value.login,
              userToken: result.value.userToken
            };
            response.send(JSON.stringify(userData));
            client.close();
          }
        );
    }
  );
});

app.post("/logon", jsonParser, function(request, response) {
  if (!request.body) {
    logError("empty request body");
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
        logErr(err);
        return;
      }
      client
        .db("blogdb")
        .collection("users")
        .findOneAndUpdate(
          { login: credentials.login, password: credentials.password },
          { $set: { userToken: generateToken(12) } },
          {
            projection: { userToken: 1, userId: 1, login: 1 },
            returnOriginal: false
          },
          function(err, result) {
            if (err) {
              logError(err);
              return response.status(403).send();
            }
            const userData = {
              id: result.value._id,
              login: result.value.login,
              userToken: result.value.userToken
            };
            response.send(JSON.stringify(userData));
            client.close();
          }
        );
    }
  );
});

app.post("/register", jsonParser, function(request, response) {
  if (!request.body) {
    logError("empty request body");
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
        logErr(err);
        return;
      }
      client
        .db("blogdb")
        .collection("users")
        .findOne({ login: credentials.login }, function(err, result) {
          if (result) {
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
