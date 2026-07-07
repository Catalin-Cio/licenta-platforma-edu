const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    getAllResources,
    uploadResource,
    getMyResources,
    deleteResource,
    buyResource,
    getPurchasedResourceIds
} = require('../controllers/resourceController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Tip de fișier neacceptat. Doar PDF, JPG și PNG sunt permise.'), false);
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } 
});

router.get('/resources', getAllResources);
router.post('/upload', upload.single('fisier'), uploadResource);
router.get('/my-resources/:userId', getMyResources);
router.delete('/resources/:id', deleteResource);
router.post('/buy', buyResource);
router.get('/purchases/:userId', getPurchasedResourceIds);

module.exports = router;