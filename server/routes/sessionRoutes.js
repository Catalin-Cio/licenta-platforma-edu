const express = require('express');
const router = express.Router();
const {
    createSession,
    getAllSessions,
    joinSession,
    cancelSession,
    getMyEnrollments,
    getSessionParticipants
} = require('../controllers/sessionController');

router.post('/sessions', createSession);
router.get('/sessions', getAllSessions);
router.post('/sessions/join', joinSession);
router.delete('/sessions/:id', cancelSession);
router.get('/my-enrollments/:userId', getMyEnrollments);
router.get('/sessions/:id/participants', getSessionParticipants);

module.exports = router;