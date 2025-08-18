const fs = require("fs");
const path = require("path");

// Path to your CITATION.cff
const cffPath = path.join(__dirname, "CITATION.cff");

// Read the file
const file = fs.readFileSync(cffPath, "utf8");

// Replace the version line (like `version: "1.1.3"`)
const newFile = file.replace(
  /^version: .*/m,
  `version: "${process.env.NEXT_RELEASE_VERSION}"`
);

// Write the updated file
fs.writeFileSync(cffPath, newFile);

console.log(
  `Updated CITATION.cff to version ${process.env.NEXT_RELEASE_VERSION}`
);
