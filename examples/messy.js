const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const SECRET = "super_secret_key_123";

let data = [];
let data2 = [];
let result = null;
let final = null;
let final_final = null;
let temp = "";

class UserManager {
  constructor() {
    this.users = [];
    this.sessions = {};
    this.temp = null;
  }

  addUser(data) {
    if (data) {
      if (data.name) {
        if (data.email) {
          if (data.password) {
            const hash = bcrypt.hashSync(data.password, 10);
            this.users.push({
              name: data.name,
              email: data.email,
              password: hash,
              createdAt: new Date(),
              role: "user",
              active: true,
            });
            return true;
          }
        }
      }
    }
    return false;
  }

  findUser(email) {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].email === email) {
        return this.users[i];
      }
    }
    return null;
  }

  deleteUser(email) {
    const idx = this.users.findIndex((u) => u.email === email);
    if (idx !== -1) {
      this.users.splice(idx, 1);
      return true;
    }
    return false;
  }
}

const manager = new UserManager();

function login(req, res) {
  const { email, password } = req.body;
  const user = manager.findUser(email);
  if (!user) {
    return res.status(401).json({ error: "not found" });
  }
  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: "wrong password" });
  }
  const token = jwt.sign({ email: user.email, role: user.role }, SECRET, {
    expiresIn: "24h",
  });
  result = token;
  res.json({ token });
}

function register(req, res) {
  const ok = manager.addUser(req.body);
  if (ok) {
    res.json({ message: "registered" });
  } else {
    res.status(400).json({ error: "bad data" });
  }
}

function verifyToken(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) {
    return res.status(403).json({ error: "no token" });
  }
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(403).json({ error: "invalid token" });
  }
}

function getProfile(req, res) {
  res.json({ user: req.user });
}

function updateProfile(req, res) {
  const user = manager.findUser(req.user.email);
  if (user) {
    if (req.body.name) user.name = req.body.name;
    res.json({ message: "updated" });
  } else {
    res.status(404).json({ error: "not found" });
  }
}

function deleteAccount(req, res) {
  manager.deleteUser(req.user.email);
  res.json({ message: "deleted" });
}

function handleData(input) {
  data = input;
  data2 = input.map((x) => x.value);
  result = data2.filter((x) => x > 0);
  final = result.reduce((a, b) => a + b, 0);
  final_final = final * 1.1;
  temp = String(final_final);
  return temp;
}

function init() {
  console.log("starting server...");
}

function processData(items) {
  let out = [];
  for (let i = 0; i < items.length; i++) {
    if (items[i] !== null && items[i] !== undefined) {
      if (typeof items[i] === "object") {
        out.push(JSON.stringify(items[i]));
      } else {
        out.push(String(items[i]));
      }
    }
  }
  return out;
}

function doSomething() {
  // TODO: implement this
  return null;
}

function helper() {
  return true;
}

function anotherHelper() {
  return false;
}

const app = express();
app.use(express.json());

app.post("/login", login);
app.post("/register", register);
app.get("/profile", verifyToken, getProfile);
app.put("/profile", verifyToken, updateProfile);
app.delete("/account", verifyToken, deleteAccount);

app.listen(3000, () => {
  init();
  console.log("server running on port 3000");
});

module.exports = { app, manager, handleData, processData };
