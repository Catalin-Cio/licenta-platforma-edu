const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadAvatar, makeAdmin, getAllUsers, deleteUser, getLeaderboard, getMyActivity } = require('../controllers/userController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Doar JPG și PNG sunt permise.'), false);
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

router.post('/user/:id/avatar', upload.single('avatar'), uploadAvatar);
router.get('/admin/make-me-admin/:email', makeAdmin);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/leaderboard', getLeaderboard);
router.get('/my-activity/:userId', getMyActivity);

module.exports = router;