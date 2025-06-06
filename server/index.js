const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const TEST_DIR = path.resolve(__dirname, "../test");

function getTestFiles() {
  const files = fs.readdirSync(TEST_DIR).filter((f) => /\.(in|out)$/.test(f));
  const groups = {};

  for (const file of files) {
    const [name, ext] = file.split(".");
    const base = name.split("-")[0];
    groups[name] = groups[name] || {};
    groups[name][ext] = file;
  }

  return Object.entries(groups).map(([key, val]) => ({
    name: key,
    inFile: val.in || null,
    outFile: val.out || null,
  }));
}

app.get("/api/tests", (req, res) => {
  const list = getTestFiles();
  res.json(list);
});

app.get("/api/test/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(TEST_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Not found");
  }
  const content = fs.readFileSync(filePath, "utf-8");
  res.send(content);
});

app.post("/api/test/:filename", (req, res) => {
  const filename = req.params.filename;
  const content = req.body.content;
  const filePath = path.join(TEST_DIR, filename);
  fs.writeFileSync(filePath, content, "utf-8");
  res.send("OK");
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
