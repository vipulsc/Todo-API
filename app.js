import "dotenv/config";
import express from "express";
import { nanoid } from "nanoid";
const app = express();
app.use(express.json());
const port = 3000;
import { loadFile, editFile } from "./index.js";
import jwt from "jsonwebtoken";
import cors from "cors";

const allowedOrigins = ["http://localhost:5500", "https://yourfrontend.com"];

app.use(cors());
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true); // Allow request
//       } else {
//         callback(new Error("Not allowed by CORS")); // Block request
//       }
//     },
//     methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
//     allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
//     credentials: true, // Allow cookies if needed
//   })
// );

// AUTHENTICATION

app.post("/signup", async (req, res) => {
  try {
    let users = await loadFile("user.json");

    if (!Array.isArray(users)) {
      users = [];
    }

    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
      return res.status(400).send("Username and password are required");
    }

    const userExists = users.some((u) => u.username === username);
    if (userExists) {
      return res
        .status(400)
        .send(`User with username ${username} already exists.`);
    }

    users.push({
      userid: nanoid(),
      username: username,
      password: password,
    });

    await editFile("user.json", users);
    return res.status(201).send("SignUP Successfully");
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).send("Internal Server Problem");
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  let users = await loadFile("user.json");
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Please enter the required fields" });
  }

  try {
    const currentUser = users.find(
      (index) => index.username === username && index.password === password
    );

    if (currentUser) {
      const JWT_SECRET = process.env.JWT_SECRET;
      if (!JWT_SECRET) {
        return res
          .status(500)
          .json({ error: "JWT Secret is missing in env file" }); // ✅ FIX: Check for missing JWT_SECRET
      }

      const token = jwt.sign({ userid: currentUser.userid }, JWT_SECRET);
      return res.status(200).json({ message: "User found", token: token });
    } else {
      return res.status(401).json({ error: "Invalid username or password" }); // ✅ FIX: Changed from res.json() to proper 401 Unauthorized
    }
  } catch (error) {
    return res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  }
});

// AUTHORIZATION MIDDLEWARE
function authorization(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized: No Token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userid = decoded.userid;
    next();
  } catch (error) {
    return res.status(400).json({ error: "Invalid Token" });
  }
}

// TASKS

// GET request - Retrieve user's tasks
app.get("/task/getDetails", authorization, async (req, res) => {
  let tasks = await loadFile("task.json");
  const currid = req.userid;

  try {
    const currTasks = tasks.filter((index) => index.userid === currid);
    if (currTasks.length === 0) {
      return res.status(404).json({ error: "No tasks found for this user" });
    }
    res.json(currTasks);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST request - Add a new task
app.post("/task/newTask", authorization, async (req, res) => {
  let tasks = await loadFile("task.json");
  const { task, due } = req.body;
  const currid = req.userid;

  if (!task) {
    return res.status(400).json({ error: "Please Enter Tasks" });
  }
  if (!due) {
    return res.status(400).json({ error: "Please Enter Due" });
  }

  const taskExist = tasks.find(
    (index) =>
      index.task === task && index.userid === currid && index.due === due
  );

  if (taskExist) {
    return res.json({ message: "Task already exists" });
  }

  try {
    const newTask = {
      userid: currid,
      taskid: nanoid(),
      task: task,
      due: due,
      status: "Pending",
    };
    tasks.push(newTask);
    await editFile("task.json", tasks);
    res.status(201).json({ message: "Task Added Successfully", task: newTask });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT request - Edit an existing task
app.put("/task/editTask", authorization, async (req, res) => {
  let tasks = await loadFile("task.json");
  const { taskid, task, status } = req.body;

  const currTask = tasks.find((index) => index.taskid === taskid);
  if (!currTask) {
    return res.status(404).json({ error: "Task not found" });
  }

  currTask.task = task || currTask.task;
  currTask.status = status || currTask.status;

  await editFile("task.json", tasks);
  return res
    .status(200)
    .json({ message: "Task updated successfully", task: currTask });
});

// DELETE request - Delete a task
app.delete("/task/delete", authorization, async (req, res) => {
  let tasks = await loadFile("task.json");
  const { taskid } = req.body;

  const currentTask = tasks.find((index) => index.taskid === taskid);
  if (!currentTask) {
    return res.status(404).json({ error: "Task not found" });
  }

  try {
    tasks = tasks.filter((index) => index.taskid !== taskid);
    await editFile("task.json", tasks);
    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
