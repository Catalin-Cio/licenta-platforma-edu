const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const register = async (req, res) => {
  try {
    const { nume, email, parola } = req.body;
    
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(parola)) {
        return res.status(400).json({ message: "Parola este prea slabă. Minim 8 caractere, o literă mare și o cifră." });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "Emailul este deja folosit!" });

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(parola, saltRounds);
    
    const newUser = await User.create({ nume, email, parola: hashedPassword });
    res.status(201).json({ message: "Cont creat cu succes!", user: newUser });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare la server" });
  }
};

const login = async (req, res) => {
  try {
    const { email, parola } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user) return res.status(404).json({ message: "Utilizatorul nu există!" });
    
    const match = await bcrypt.compare(parola, user.parola);
    if (!match) return res.status(401).json({ message: "Parolă incorectă!" });
    
    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
    
    res.json({
      message: "Login reușit!",
      token: token,
      user: {
        id: user.id,
        nume: user.nume,
        email: user.email,
        wallet: user.wallet,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare server" });
  }
};

module.exports = { register, login };