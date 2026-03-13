var http = require("http");
var fs = require("fs");
var url = require("url");

var PORT = 8080;
var data = {};
var cache = {};
var tmp = null;
var result = null;
var result2 = null;
var flag = false;

function init() {
  data = {};
  cache = {};
  tmp = null;
  result = null;
  result2 = null;
  flag = false;
  console.log("system initialized");
}

function loadConfig() {
  try {
    var raw = fs.readFileSync("config.json", "utf-8");
    var config = JSON.parse(raw);
    data.config = config;
    return config;
  } catch (e) {
    console.log("no config found");
    return {};
  }
}

function handleRequest(req, res) {
  var parsed = url.parse(req.url, true);
  var path = parsed.pathname;
  var query = parsed.query;

  if (path === "/") {
    res.writeHead(200);
    res.end("ok");
  } else if (path === "/api/data") {
    if (req.method === "GET") {
      getData(req, res, query);
    } else if (req.method === "POST") {
      postData(req, res);
    } else {
      res.writeHead(405);
      res.end("method not allowed");
    }
  } else if (path === "/api/process") {
    processRequest(req, res, query);
  } else if (path === "/api/search") {
    if (query.q) {
      searchData(req, res, query.q);
    } else {
      res.writeHead(400);
      res.end("missing query");
    }
  } else if (path === "/api/admin") {
    if (query.key === "admin123") {
      adminPanel(req, res);
    } else {
      res.writeHead(403);
      res.end("forbidden");
    }
  } else if (path === "/health") {
    res.writeHead(200);
    res.end(JSON.stringify({ status: "ok", uptime: process.uptime() }));
  } else {
    res.writeHead(404);
    res.end("not found");
  }
}

function getData(req, res, query) {
  var id = query.id;
  if (id) {
    if (cache[id]) {
      res.writeHead(200);
      res.end(JSON.stringify(cache[id]));
    } else {
      if (data[id]) {
        cache[id] = data[id];
        res.writeHead(200);
        res.end(JSON.stringify(data[id]));
      } else {
        res.writeHead(404);
        res.end("not found");
      }
    }
  } else {
    res.writeHead(200);
    res.end(JSON.stringify(Object.keys(data)));
  }
}

function postData(req, res) {
  var body = "";
  req.on("data", function (chunk) {
    body += chunk;
  });
  req.on("end", function () {
    try {
      var parsed = JSON.parse(body);
      if (parsed.id && parsed.value) {
        data[parsed.id] = parsed.value;
        cache[parsed.id] = parsed.value;
        result = parsed.id;
        res.writeHead(200);
        res.end("saved");
      } else {
        res.writeHead(400);
        res.end("bad request");
      }
    } catch (e) {
      res.writeHead(400);
      res.end("invalid json");
    }
  });
}

function processRequest(req, res, query) {
  var type = query.type || "default";
  var items = Object.values(data);
  var processed = [];

  for (var i = 0; i < items.length; i++) {
    if (items[i] !== null && items[i] !== undefined) {
      if (type === "string") {
        processed.push(String(items[i]));
      } else if (type === "number") {
        var n = Number(items[i]);
        if (!isNaN(n)) {
          processed.push(n);
        }
      } else if (type === "json") {
        try {
          processed.push(JSON.parse(items[i]));
        } catch (e) {
          processed.push(items[i]);
        }
      } else {
        processed.push(items[i]);
      }
    }
  }

  result2 = processed;
  res.writeHead(200);
  res.end(JSON.stringify(processed));
}

function searchData(req, res, query) {
  var results = [];
  var keys = Object.keys(data);
  for (var i = 0; i < keys.length; i++) {
    if (keys[i].indexOf(query) !== -1) {
      results.push({ key: keys[i], value: data[keys[i]] });
    } else if (typeof data[keys[i]] === "string" && data[keys[i]].indexOf(query) !== -1) {
      results.push({ key: keys[i], value: data[keys[i]] });
    }
  }
  res.writeHead(200);
  res.end(JSON.stringify(results));
}

function adminPanel(req, res) {
  var stats = {
    totalKeys: Object.keys(data).length,
    cacheSize: Object.keys(cache).length,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };
  res.writeHead(200);
  res.end(JSON.stringify(stats));
}

function validateInput(input) {
  if (!input) return false;
  if (typeof input !== "string") return false;
  if (input.length > 10000) return false;
  if (input.length < 1) return false;
  return true;
}

function formatOutput(data) {
  if (Array.isArray(data)) {
    return data.map(function (item) {
      return String(item);
    });
  }
  return String(data);
}

function cleanup() {
  data = {};
  cache = {};
  tmp = null;
  result = null;
  result2 = null;
  flag = false;
  console.log("cleanup done");
}

function logRequest(method, path) {
  var timestamp = new Date().toISOString();
  console.log("[" + timestamp + "] " + method + " " + path);
}

function startServer() {
  init();
  loadConfig();

  var server = http.createServer(function (req, res) {
    logRequest(req.method, req.url);
    handleRequest(req, res);
  });

  server.listen(PORT, function () {
    console.log("server running on port " + PORT);
  });
}

startServer();

module.exports = {
  handleRequest: handleRequest,
  getData: getData,
  postData: postData,
  processRequest: processRequest,
  searchData: searchData,
  validateInput: validateInput,
  cleanup: cleanup,
};
