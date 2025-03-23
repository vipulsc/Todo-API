import express from "express";
import { nanoid } from "nanoid";
const app = express();
app.use(express.json());
const port = 3000;
import { loadFile, editFile } from "./routes/index.js";

//AUTHENTICATION

app.post("/signup", async (req, res) => {
  try {
    let users = await loadFile("user.json");

    const { username, password } = req.body;

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
    res.status(201).send("SignUP Successfully");
  } catch (error) {
    throw error;
    res
  }
});

// TASKS

//get request

//post request

//put request

//delete request

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
