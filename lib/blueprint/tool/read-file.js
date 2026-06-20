'use strict';

/**
 * conductor://tools/read-file
 * Reads a file and writes its content to stdout.
 * Usage: node read-file.js <filepath>
 * Exit: 0 on success, 1 if file not found or unreadable.
 */

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
if (!filePath) {
  console.error('read-file: missing argument <filepath>');
  process.exit(1);
}

const resolved = path.resolve(filePath);

try {
  const content = fs.readFileSync(resolved, 'utf8');
  process.stdout.write(content);
  process.exit(0);
} catch (err) {
  if (err.code === 'ENOENT') {
    console.error(`read-file: file not found: ${resolved}`);
  } else if (err.code === 'EACCES') {
    console.error(`read-file: permission denied: ${resolved}`);
  } else {
    console.error(`read-file: ${err.message}`);
  }
  process.exit(1);
}
