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
app.get('/', (req,res)=>{
    res.send("hello from host ")
})

// Upload endpoint
app.post('/upload-pdf', upload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'Please, Upload file First !!' });

    let response = [];
    for (const file of req.files) {
      const buffer = fs.readFileSync(file.path);
      const data = await pdfParse(buffer);
      // TODO: Chunk + embed + store (next steps) after that
      response.push({ filename: file.filename, pages: data.numpages, textLength: data.text.length });
    }
    res.json({ message: 'Files processed Done', files: response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error : 'The Error is from our side Please dont waste time with us' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
