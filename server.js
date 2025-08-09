const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 5000;

// Use CORS to allow requests from your React app
app.use(cors());

// API endpoint to execute the Python script and get data
app.get('/api/mindmaps', (req, res) => {
  const pythonScriptPath = path.join(__dirname, 'process_data.py');
  
  // Use 'exec' to run the Python script
  exec(`python ${pythonScriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing Python script: ${error.message}`);
      return res.status(500).send(`Server error: ${error.message}`);
    }
    if (stderr) {
      console.error(`Python script stderr: ${stderr}`);
      return res.status(500).send(`Python script error: ${stderr}`);
    }

    try {
      // The Python script should print a JSON array to stdout
      const mindMaps = JSON.parse(stdout);
      res.json(mindMaps);
    } catch (e) {
      console.error(`Failed to parse JSON from Python script: ${e.message}`);
      return res.status(500).send(`Failed to parse JSON: ${e.message}`);
    }
  });
});

app.listen(port, () => {
  console.log(`Node.js server listening at http://localhost:${port}`);
});
