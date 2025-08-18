const fs = require("fs");
const path = require("path");

const newVersion = process.argv[2];

// Path to your CITATION.cff
const cffPath = path.join(__dirname, "CITATION.cff");

// Read the file
const file = fs.readFileSync(cffPath, "utf8");

// Replace the version line (like `version: "1.1.3"`)
const newFile = file.replace(/^version: .*/m, `version: "${newVersion}"`);

// Write the updated file
fs.writeFileSync(cffPath, newFile);

console.log(`Updated CITATION.cff to version ${newVersion}`);
