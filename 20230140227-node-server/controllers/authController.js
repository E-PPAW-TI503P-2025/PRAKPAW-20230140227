const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'jwtsecret123';

exports.register = async (req, res) => {
  try {
    // 1. Ambil data dari body (ini yang kurang di kode Anda)
    const { nama, email, password, role } = req.body;

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 3. Buat user baru
    const newUser = await User.create({
      nama,
      email,
      password: hashedPassword,
      role: role || 'mahasiswa'
    });

    // 4. Kirim respons sukses
    res.status(201).json({
      message: "Registrasi berhasil",
      data: { id: newUser.id, email: newUser.email, role: newUser.role }
    });

  } catch (error) {
    // 5. Tangani error
    
    // Ini untuk debugging di terminal Anda
    console.error("!!! ERROR REGISTRASI:", error); 

    // Ini untuk error jika email sudah ada
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Email sudah terdaftar." });
    }
    
    // Ini untuk error server lainnya
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};


// FUNGSI LOGIN (Sudah benar dari kode Anda)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Email tidak ditemukan." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password salah." });
    }

    const payload = {
      id: user.id,
      nama: user.nama,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '1h'
    });

    res.json({
      message: "Login berhasil",
      token: token
    });

  } catch (error) {
    console.error("!!! ERROR LOGIN:", error); // Saya tambahkan ini untuk debugging
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};