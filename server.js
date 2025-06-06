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

// Utility chunking function
const { chunkText } = require('./utils');

app.get('/', (req,res)=>{
    res.send("hello from host")
})

// Upload endpoint
app.post('/upload-pdf', upload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    let response = [];

    for (const file of req.files) {
      const buffer = fs.readFileSync(file.path);
      const data = await pdfParse(buffer);
      const rawText = data.text;
      const chunks = chunkText(rawText, 1000);

      console.log(`PDF "${file.originalname}" → ${chunks.length} chunks`);

      response.push({
        filename: file.originalname,
        pages: data.numpages,
        textLength: rawText.length,
        chunkCount: chunks.length,
      });

      // Save chunks JSON file using the multer filename (unique)
      const chunkPath = path.join(UPLOAD_DIR, file.filename + '_chunks.json');
      fs.writeFileSync(chunkPath, JSON.stringify(chunks, null, 2));
      console.log(` Saved chunk file: ${chunkPath}`);
    }

    res.json({ message: 'PDFs chunked successfully', files: response });
  } catch (err) {
    console.error('Error during chunking:', err);
    res.status(500).json({ error: 'Server error while chunking PDFs' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
