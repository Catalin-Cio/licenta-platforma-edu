const express = require('express');
const router = express.Router();
const multer = require('multer');
const { chatWithAI, extractText } = require('../controllers/aiController');

const uploadTemp = multer({ dest: 'uploads/' });

router.post('/chat', chatWithAI);
router.post('/extract', uploadTemp.single('fisier'), extractText);

module.exports = router;