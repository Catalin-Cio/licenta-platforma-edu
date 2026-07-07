const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // 1. Luăm tokenul din header-ul cererii HTTP
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ message: "Acces interzis! Token lipsă." });
    }

    // 2. Extragem doar token-ul (fără cuvântul "Bearer ")
    const token = authHeader.split(' ')[1];

    try {
        // 3. Verificăm dacă tokenul e valid și nu a expirat
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Atașăm datele utilizatorului la request
        next(); // Îl lăsăm să treacă mai departe
    } catch (err) {
        return res.status(401).json({ message: "Token invalid sau expirat." });
    }
};

module.exports = authMiddleware;