const express = require("express");
const Task = require("../models/tasks");
const auth = require("../middleware/auth");
const { request } = require("express");

const router = new express.Router();

router.post("/task", auth, async (req, res) => {
  // const task = new Task(req.body);
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await task.save();
    res.status(200).send(task);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Get /tasks?complete=true
// Get /tasks?limit=10&skip=10
// Get /tasks?sortBy=createdAt:desc

router.get("/task", auth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = part[1] === "desc" ? -1 : 1;
  }
  try {
    // const tasks = await Task.findOne({ owner: req.user._id });
    console.log(req.user);
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    res.status(200).send(req.user.tasks);
  } catch (e) {
    (e) => res.status(500).send(e);
  }
});

router.get("/task/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const tasks = await Task.findOne({ _id, owner: req.user._id });
    if (!tasks) {
      return res.status(400);
    }
    res.send(tasks);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.patch("/task/:id", async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["desc", "completed"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  const id = req.params.id;

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid update operation" });
  }

  try {
    console.log(id);
    const task = await Task.findOne({ _id: id, owner: req.user._id });
    // const task = await Task.findById(id);

    if (!task) {
      return res.status(404).send({ error: "Not found" });
    }

    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/task/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;

    const task = await Task.findOneAndDelete({ _id: id, owner: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
