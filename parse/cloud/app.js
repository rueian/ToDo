var express = require('express');
var app = express();

app.use(express.bodyParser());    // Middleware for reading request body

app.get('/manifest.webapp', function(req, res) {
  res.set('Content-Type', 'application/x-web-app-manifest+json');
  res.json({
    "name": "ToDo",
    "description": "A simple ToDo list that enables you to easily assign tasks to your friends on Facebook.",
    "launch_path": "/index.html",
    "icons": {
      "128": "/img/128.png",
      "512": "/img/512.png"
    },
    "developer": {
      "name": "Ruian",
      "url": "https://github.com/rueian"
    },
    "type": "web"
  });
});

// This line is required to make Express respond to http requests.
app.listen();
