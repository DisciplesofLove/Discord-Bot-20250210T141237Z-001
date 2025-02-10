const { spawn } = require('child_process');
const path = require('path');

// Run the file organization script
console.log('Starting file organization...');

const organizer = spawn('node', [path.join(__dirname, '..', 'organize-files.js')]);

organizer.stdout.on('data', (data) => {
  console.log(`${data}`);
});

organizer.stderr.on('data', (data) => {
  console.error(`Error: ${data}`);
});

organizer.on('close', (code) => {
  if (code === 0) {
    console.log('File organization completed successfully');
  } else {
    console.error(`File organization process exited with code ${code}`);
  }
});