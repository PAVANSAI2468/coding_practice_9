const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbpath = path.join(__dirname, "userData.db");
const app = express();
app.use(express.json());
let db = null;
const bcrypt = require("bcrypt");
const intailiseServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running");
    });
  } catch (e) {
    console.log(`db error:${e.message}`);
    process.exit(1);
  }
};
intailiseServer();
app.post("/register/", async (req, res) => {
  const { username, name, password, gender, location } = req.body;
  const hashPassword = await bcrypt.hash(password, 10);
  const getUsername = `select username from user where username='${username}';`;
  const fromDB = await db.get(getUsername);
  if (fromDB !== undefined) {
    res.status(400);
    res.send("User already exists");
  } else {
    const addingUserDetaisls = `INSERT INTO user
                                    (username, name, password, gender, location)
                                VALUES(
                                    '${username}',
                                    '${name}',
                                    '${password}',
                                    '${gender}',
                                    '${location}'
                                );`;
    if (password.length < 5) {
      res.status(400);
      res.send("Password is too short");
    } else {
      await db.run(addingUserDetaisls);
      res.status(200);
      res.send("User created successfully");
    }
  }
});
app.post("/login/", async (req, res) => {
  const { username, password } = req.body;
  const hashPassword = await bcrypt.hash(password, 10);
  const getUsername = `select username from user where username='${username}';`;
  const fromDB = await db.get(getUsername);
  if (fromDB === undefined) {
    res.status(400);
    res.send("Invalid user");
  } else {
    const isCorrectPassword = await bcrypt.compare(password, fromDB.password);
    console.log(isCorrectPassword);
    if (isCorrectPassword === true) {
      res.status(200);
      res.send("Login success!");
    } else {
      res.status(400);
      res.send("Invalid password");
    }
  }
});
app.put("/change-password/", async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  const hashNewPassword = await bcrypt.hash(newPassword, 10);
  const getPassword = `select password from user where username='${username}';`;
  const fromdb = await db.get(getPassword);
  if (fromdb !== oldPassword) {
    res.status(400);
    res.send("Invalid current password");
  } else {
    if (newPassword.length < 5) {
      req.status(400);
      req.send(" Password is too short");
    } else {
      const updatePassword = `UPDATE user SET password='${newPassword}'`;
      res.status(200);
      res.send("Password updated");
    }
  }
});
module.exports = app;
