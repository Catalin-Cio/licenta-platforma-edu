const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');
const PDFParser = require("pdf2json");
const { Resource } = require('../models');

const chatWithAI = async (req, res) => {
    try {
        const { resourceId, messages, customContext } = req.body;
        let contextText = customContext || "";

        if (resourceId) {
            const resource = await Resource.findByPk(resourceId);
            if (resource) {
                const filePath = path.join(__dirname, '../uploads', resource.numeFisier);
                if (fs.existsSync(filePath)) {
                    const ext = path.extname(resource.numeFisier).toLowerCase();
                    
                    if (ext === '.pdf') {
                        contextText = await new Promise((resolve, reject) => {
                            const pdfParser = new PDFParser(this, 1);
                            pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
                            pdfParser.on("pdfParser_dataReady", pdfData => {
                                resolve(pdfParser.getRawTextContent().substring(0, 3000));
                            });
                            pdfParser.loadPDF(filePath);
                        });
                    } else if (['.jpg', '.jpeg', '.png'].includes(ext)) {
                        const { data: { text } } = await Tesseract.recognize(filePath, 'eng+ron');
                        contextText = text.substring(0, 3000);
                    }
                }
            }
        }

        const systemMessage = {
            role: "system",
            content: `Ești Mentorium AI, un profesor universitar de nota 10, prietenos și concis.
            Răspunzi mereu în LIMBA ROMÂNĂ și folosești emoji-uri ocazional.
            
            REGULĂ ABSOLUTĂ ȘI STRICTĂ: Ești un asistent EXCLUSIV EDUCAȚIONAL...
            
            Dacă primești un text extras dintr-un curs/poză, folosește-l pentru a răspunde: \n""" ${contextText} """\n
            Dacă textul e gol, ajută studentul folosind cunoștințele tale academice.`
        };

        const chatHistory = [systemMessage, ...messages];

        const response = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3',
                messages: chatHistory,
                stream: true 
            })
        });

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Transfer-Encoding', 'chunked');

        for await (const chunk of response.body) {
            res.write(chunk);
        }
        res.end();

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Eroare la AI." });
    }
};

const extractText = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "Niciun fișier primit." });
        const filePath = req.file.path;
        const ext = path.extname(req.file.originalname).toLowerCase();
        let extractedText = "";

        if (ext === '.pdf') {
            const PDFParser = require("pdf2json");
            extractedText = await new Promise((resolve, reject) => {
                const pdfParser = new PDFParser(this, 1);
                pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
                pdfParser.on("pdfParser_dataReady", pdfData => {
                    resolve(pdfParser.getRawTextContent().substring(0, 3000));
                });
                pdfParser.loadPDF(filePath);
            });
        } else if (['.jpg', '.jpeg', '.png'].includes(ext)) {
            const { data: { text } } = await Tesseract.recognize(filePath, 'eng+ron');
            extractedText = text.substring(0, 3000);
        }
        
        fs.unlinkSync(filePath); 
        
        res.json({ text: extractedText });
    } catch (err) {
        console.error("Eroare la extragerea textului:", err);
        res.status(500).json({ error: "Eroare la procesarea fișierului." });
    }
};

module.exports = { chatWithAI, extractText };