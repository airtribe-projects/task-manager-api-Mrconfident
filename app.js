const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, (err) => {
  if (err) {
    return console.log("Something bad happened", err);
  }
  console.log(`Server is listening on ${port}`);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/tasks", (req, res) => {
  const { completed } = req.query;
  readFile((tasks) => {
    let result = tasks;
    // if (completed !== undefined) {
    //   // Convert "true"/"false" string to boolean
    //   const isCompleted = completed === "true";
    //   result = tasks.filter((task) => task.completed === isCompleted);
    // }
    res.json(result);
  });
});

app.get("/tasks/:id", (req, res) => {
  readFile((tasks) => {
    const task = tasks.find((t) => t.id === parseInt(req.params.id));
    if (task) {
      res.json(task);
    } else {
      res.status(404).send("Task not found");
    }
  });
});

app.post("/tasks", (req, res) => {
  const { title, description, completed } = req.body;
  if (
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof completed !== "boolean"
  ) {
    return res.status(400).json({ error: "Invalid task data" });
  }
  readFile((tasks) => {
    const newTask = { title, description, completed, id: tasks.length + 1 };
    tasks.push(newTask);
    writeFile(tasks, () => res.status(201).json(newTask));
  });
});

app.delete("/tasks/:id", (req, res) => {
  readFile((tasks) => {
    const index = tasks.findIndex((t) => t.id === parseInt(req.params.id));
    if (index !== -1) {
      tasks.splice(index, 1);
      writeFile(tasks, () => res.send(`Task with id ${req.params.id} deleted`));
    } else {
      res.status(404).send("Task not found");
    }
  });
});

app.put("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const { title, description, completed } = req.body;
  if (
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof completed !== "boolean"
  ) {
    return res.status(400).json({ error: "Invalid task data" });
  }
  readFile((tasks) => {
    const index = tasks.findIndex((t) => t.id === taskId);
    if (index === -1) {
      return res.status(404).json({ error: "Task not found" });
    }

    tasks[index] = { ...tasks[index], title, description, completed };
    writeFile(tasks, () => {
      res.status(200).json({ message: "Task updated successfully" });
    });
  });
});

// Read file utility
const readFile = (callback) => {
  fs.readFile("task.json", "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      callback([]);
    } else {
      try {
        const json = JSON.parse(data);
        callback(json.tasks || []);
      } catch (parseErr) {
        console.error("Error parsing JSON:", parseErr);
        callback([]);
      }
    }
  });
};

// Write file utility
const writeFile = (tasks, callback) => {
  const data = JSON.stringify({ tasks }, null, 2);
  fs.writeFile("task.json", data, "utf-8", (err) => {
    if (err) {
      console.error("Error writing file:", err);
    }
    callback();
  });
};

module.exports = app;
