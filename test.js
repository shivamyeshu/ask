const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const testData = ['chunk1', 'chunk2', 'chunk3'];

try {
  const chunkPath = path.join(UPLOAD_DIR, 'test_chunks.json');
  fs.writeFileSync(chunkPath, JSON.stringify(testData, null, 2));
  console.log('Test chunk JSON saved:', chunkPath);
} catch (e) {
  console.error('Error saving test chunk JSON:', e);
}
