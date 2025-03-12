import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
let PORT = process.env.PORT || 3000;

// Check for port argument
const portIndex = args.indexOf("--port");
if (portIndex !== -1 && args.length > portIndex + 1) {
  PORT = parseInt(args[portIndex + 1], 10);
}

const app = express();

// Serve static files from the current directory
app.use(express.static(__dirname));

// Route for the home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`View the FLL Competition Schedule at http://localhost:${PORT}`);
});
