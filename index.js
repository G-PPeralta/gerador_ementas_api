const express = require('express');
const { Configuration, OpenAIApi } = require('openai');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.json());

const configuration = new Configuration({
  apiKey: '',
});
const openai = new OpenAIApi(configuration);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.post('/create-summary', upload.single('file'), async (req, res) => {
  try {
    const { path: filePath } = req.file;

    const inputText = fs.readFileSync(filePath, 'utf-8');

    const prompt = 'Você é uma ferramenta de criação de ementas de acórdãos de Tribunais. Seu papel é ler o acórdão e criar uma ementa para ele, seguindo as diretrizes para a elaboração de ementas do Conselho Nacional De Justiça.';

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: inputText },
      ],
      temperature: 0,
    });

    const aiResponse = response.data.choices[0].message?.content;

    fs.writeFileSync('summary.txt', aiResponse);

    return res.json({ success: true, message: 'Summary created successfully', data: aiResponse });
  } catch (error) {
    console.error('Error creating summary:', error);
    res.status(500).json({ success: false, message: 'Error creating summary' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
