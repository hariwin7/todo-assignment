const express = require("express");
const { v4: generateId } = require("uuid");
const database = require("./database");

const app = express();

const PAGE_SIZE = 5;

function requestLogger(req, res, next) {
  res.once("finish", () => {
    const log = [req.method, req.path];
    if (req.body && Object.keys(req.body).length > 0) {
      log.push(JSON.stringify(req.body));
    }
    if (req.query && Object.keys(req.query).length > 0) {
      log.push(JSON.stringify(req.query));
    }
    log.push("->", res.statusCode);
    // eslint-disable-next-line no-console
    console.log(log.join(" "));
  });
  next();
}

app.use(requestLogger);
app.use(require("cors")());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/:skipItems/:dueDate?", async (req, res) => {
  try {
    const { dueDate, skipItems } = req.params;

    if (dueDate && typeof dueDate !== "string") {
      res.status(400);
      res.json({ message: "invalid 'dueDate' expected date" });
      return;
    }
    const skip = parseInt(skipItems);

    if (skip === NaN) {
      res.status(400);
      res.json({ message: "invalid 'skip' expected number" });
      return;
    }

    const todos = database.client.db("todos").collection("todos");

    const query = dueDate ? { dueDate } : {};
    const totalCount = await todos.countDocuments(query);
    let pagination = {
      skip,
      totalCount,
      pageSize: PAGE_SIZE,
      hasMore: skip + PAGE_SIZE < totalCount,
    };
    const data = await todos
      .find(query)
      .limit(PAGE_SIZE)
      .skip(skip)
      .sort({ order: 1 })
      .toArray();

    res.status(200);
    res.json({ data, pagination });
  } catch (err) {
    console.log("getApi Error:", err);
  }
});

app.post("/", async (req, res) => {
  try {
    const { text, dueDate, order } = req.body;

    if (typeof text !== "string") {
      res.status(400);
      res.json({ message: "invalid 'text' expected string" });
      return;
    }

    if (typeof dueDate !== "string") {
      res.status(400);
      res.json({ message: "invalid 'dueDate' expected date" });
      return;
    }

    if (typeof order !== "number") {
      res.status(400);
      res.json({ message: "invalid 'order' expected number" });
      return;
    }

    const todo = { id: generateId(), text, completed: false, dueDate, order };
    await database.client.db("todos").collection("todos").insertOne(todo);
    res.status(201);
    res.json(todo);
  } catch (err) {
    res.status(400).send({ message: err });
    console.log("create todo api Error:", err);
  }
});

app.put("/update-order/", async (req, res) => {
  try {
    const { id, newOrder, order } = req.body;

    if (!id) {
      res.status(400);
      res.json({ message: "id is required" });
      return;
    }

    if (!newOrder) {
      res.status(400);
      res.json({ message: "newOrder is required" });
      return;
    } else if (typeof newOrder !== "number") {
      res.status(400);
      res.json({ message: "invalid 'newOrder' expected number" });
      return;
    }
    if (!order) {
      res.status(400);
      res.json({ message: "order is required" });
      return;
    } else if (typeof order !== "number") {
      res.status(400);
      res.json({ message: "invalid 'order' expected number" });
      return;
    }

    if (order > newOrder)
      await database.client
        .db("todos")
        .collection("todos")
        .updateMany({ order: { $gte: newOrder } }, { $inc: { order: 1 } });
    else
      await database.client
        .db("todos")
        .collection("todos")
        .updateMany({ order: { $lte: newOrder } }, { $inc: { order: -1 } });

    await database.client
      .db("todos")
      .collection("todos")
      .updateOne({ id }, { $set: { order: newOrder } });

    res.status(200);
    res.end();
  } catch (err) {
    res.status(400).send({ message: err });
    console.log("update order todo api Error:", err);
  }
});

app.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    if (typeof completed !== "boolean") {
      res.status(400);
      res.json({ message: "invalid 'completed' expected boolean" });
      return;
    }

    await database.client
      .db("todos")
      .collection("todos")
      .updateOne({ id }, { $set: { completed } });
    res.status(200);
    res.end();
  } catch (err) {
    res.status(400).send({ message: err });
    console.log("update todo api Error:", err);
  }
});

app.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await database.client.db("todos").collection("todos").deleteOne({ id });
    res.status(203);
    res.end();
  } catch (err) {
    res.status(400).send({ message: err });
    console.log("delete todo api Error:", err);
  }
});

module.exports = app;
