require('dotenv').config();
const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Storage folder for uploaded PDFs
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname)
});
const upload = multer({ storage });

// Dummy chunkText util - replace with your actual chunking logic
function chunkText(text, chunkSize = 1000) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + chunkSize));
    start += chunkSize;
  }
  return chunks;
}

app.get('/', (req, res) => {
  res.send("Hello from MindzFlair PDF QnA backend");
});

// Upload endpoint
app.post('/upload-pdf', upload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    console.log('Files received:', req.files.map(f => f.originalname));

    let response = [];

    for (const file of req.files) {
      console.log(`Processing file: ${file.filename}`);

      const buffer = fs.readFileSync(file.path);
      const data = await pdfParse(buffer);
      const rawText = data.text;

      const chunks = chunkText(rawText, 1000);
      console.log(`Chunks count for "${file.originalname}":`, chunks.length);
      console.log('Chunks preview:', chunks.slice(0, 2));

      try {
        const chunkPath = path.join(UPLOAD_DIR, file.filename + '_chunks.json');
        fs.writeFileSync(chunkPath, JSON.stringify(chunks, null, 2));
        console.log(`Saved chunk file: ${chunkPath}`);
      } catch (err) {
        console.error('Error writing chunk JSON:', err);
        return res.status(500).json({ error: 'Failed to save chunk JSON' });
      }

      response.push({
        filename: file.originalname,
        pages: data.numpages,
        textLength: rawText.length,
        chunkCount: chunks.length,
      });
    }

    res.json({ message: 'PDFs chunked successfully', files: response });
  } catch (err) {
    console.error('Error during chunking:', err);
    res.status(500).json({ error: 'Server error while chunking PDFs' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
