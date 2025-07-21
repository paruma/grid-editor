const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const os = require("os");

const app = express();
app.use(cors());
app.use(express.json());

const homeDir = os.homedir();
const BASE_DIR = path.resolve(homeDir, "dev/atcoder/atcoder_rust/src/contest/2025");

function getTestFiles(contest, problem) {
  if (!contest || !problem) {
    throw new Error("Missing contest or problem parameter");
  }

  const testDir = path.resolve(BASE_DIR, contest, problem, "test");

  // ディレクトリが存在するかチェック
  if (!fs.existsSync(testDir)) {
    throw new Error(`Test directory not found: ${testDir}`);
  }

  const files = fs.readdirSync(testDir).filter((f) => /\.(in|out|comment)$/.test(f));
  const groups = {};

  for (const file of files) {
    const [name, ext] = file.split(".");
    groups[name] = groups[name] || {};
    groups[name][ext] = file;
  }

  return Object.entries(groups).map(([key, val]) => ({
    name: key,
    inFile: val.in ? path.join(contest, problem, "test", val.in) : null,
    outFile: val.out ? path.join(contest, problem, "test", val.out) : null,
    commentFile: val.comment ? path.join(contest, problem, "test", val.comment) : null,
  }));
}

app.get("/api/tests", (req, res) => {
  try {
    const { contest, problem } = req.query;
    const list = getTestFiles(contest, problem);
    res.json(list);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});


app.get("/api/test/:filename(*)", (req, res) => {
  // filenameは "abc408/a/test/sample-1.in" みたいな形を想定
  const filename = req.params.filename;

  // BASE_DIR直下を起点に安全なパスを作る
  const filePath = path.resolve(BASE_DIR, filename);

  if (!filePath.startsWith(BASE_DIR)) {
    return res.status(400).send("Invalid file path");
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Not found");
  }
  const content = fs.readFileSync(filePath, "utf-8");
  res.send(content);
});

app.post("/api/test/:filename(*)", (req, res) => {
  const filename = req.params.filename;
  const content = req.body.content;

  const filePath = path.resolve(BASE_DIR, filename);
  if (!filePath.startsWith(BASE_DIR)) {
    return res.status(400).send("Invalid file path");
  }

  fs.writeFileSync(filePath, content, "utf-8");
  res.send("OK");
});

app.post("/api/rename", (req, res) => {
  const { contest, problem, oldName, newName } = req.body;

  if (!contest || !problem || !oldName || !newName) {
    return res.status(400).send("Missing parameters");
  }

  const testDir = path.resolve(BASE_DIR, contest, problem, "test");
  if (!testDir.startsWith(BASE_DIR)) {
    return res.status(400).send("Invalid path");
  }

  const oldInPath = path.join(testDir, `${oldName}.in`);
  const newInPath = path.join(testDir, `${newName}.in`);
  const oldOutPath = path.join(testDir, `${oldName}.out`);
  const newOutPath = path.join(testDir, `${newName}.out`);

  try {
    if (fs.existsSync(oldInPath)) {
      fs.renameSync(oldInPath, newInPath);
    }
    if (fs.existsSync(oldOutPath)) {
      fs.renameSync(oldOutPath, newOutPath);
    }
    res.send("OK");
  } catch (error) {
    res.status(500).send("Error renaming files");
  }
});

app.delete("/api/sample", (req, res) => {
  const { contest, problem, name } = req.query;

  if (!contest || !problem || !name) {
    return res.status(400).send("Missing parameters");
  }

  const testDir = path.resolve(BASE_DIR, contest, problem, "test");
  if (!testDir.startsWith(BASE_DIR)) {
    return res.status(400).send("Invalid path");
  }

  const inPath = path.join(testDir, `${name}.in`);
  const outPath = path.join(testDir, `${name}.out`);

  try {
    if (fs.existsSync(inPath)) {
      fs.unlinkSync(inPath);
    }
    if (fs.existsSync(outPath)) {
      fs.unlinkSync(outPath);
    }
    res.send("OK");
  } catch (error) {
    console.error("Error deleting files:", error);
    res.status(500).send("Error deleting files");
  }
});

app.post("/api/duplicate", (req, res) => {
  const { contest, problem, originalName, newName: requestedNewName } = req.body;

  if (!contest || !problem || !originalName) {
    return res.status(400).send("Missing parameters");
  }

  const testDir = path.resolve(BASE_DIR, contest, problem, "test");
  if (!testDir.startsWith(BASE_DIR)) {
    return res.status(400).send("Invalid path");
  }

  const originalInPath = path.join(testDir, `${originalName}.in`);
  const originalOutPath = path.join(testDir, `${originalName}.out`);

  if (!fs.existsSync(originalInPath) && !fs.existsSync(originalOutPath)) {
    return res.status(404).send("Original sample files not found");
  }

  let newName = requestedNewName;
  if (!newName) {
    let counter = 1;
    do {
      newName = `${originalName}_copy${counter > 1 ? counter : ''}`;
      counter++;
    } while (fs.existsSync(path.join(testDir, `${newName}.in`)) || fs.existsSync(path.join(testDir, `${newName}.out`)));
  }

  const newInPath = path.join(testDir, `${newName}.in`);
  const newOutPath = path.join(testDir, `${newName}.out`);

  try {
    if (fs.existsSync(originalInPath)) {
      fs.copyFileSync(originalInPath, newInPath);
    }
    if (fs.existsSync(originalOutPath)) {
      fs.copyFileSync(originalOutPath, newOutPath);
    }
    res.json({ newName });
  } catch (error) {
    console.error("Error duplicating files:", error);
    res.status(500).send("Error duplicating files");
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
