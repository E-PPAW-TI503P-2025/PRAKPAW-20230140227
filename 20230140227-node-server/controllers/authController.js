const db = require('../models'); // Import seluruh object db
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// === SETUP MODEL USER DENGAN PENGECEKAN ===
// Mencoba mengambil User, jika tidak ada, coba 'users', atau 'user' (lowercase)
const User = db.User || db.users || db.user; 

const JWT_SECRET = 'jwtsecret123';

// === DEBUGGING DI TERMINAL ===
// Ini akan muncul saat pertama kali server dijalankan
if (!User) {
    console.error("!!! FATAL ERROR: Model 'User' tidak ditemukan di models/index.js");
    console.error("Cek console.log 'Model Loaded' saat start server untuk melihat nama yang benar.");
} else {
    console.log(">> AuthController siap. Model User ditemukan.");
}

exports.register = async (req, res) => {
  try {
    const { nama, email, password, role } = req.body;

    // Validasi input sederhana
    if (!email || !password) {
        return res.status(400).json({ message: "Email dan Password wajib diisi" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await User.create({
      nama,
      email,
      password: hashedPassword,
      role: role || 'mahasiswa'
    });

    res.status(201).json({
      message: "Registrasi berhasil",
      data: { id: newUser.id, email: newUser.email, role: newUser.role }
    });

  } catch (error) {
    console.error("!!! ERROR REGISTRASI:", error); 

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "Email sudah terdaftar." });
    }
    
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Pastikan Model User ada sebelum lanjut
    if (!User) {
        return res.status(500).json({ message: "Konfigurasi Server Error: Model User tidak ditemukan." });
    }

    // Cek input
    if (!email || !password) {
        return res.status(400).json({ message: "Email dan Password harus diisi." });
    }

    // Cari user
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ message: "Email tidak ditemukan." });
    }

    // Cek Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password salah." });
    }

    // Buat Token
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
    console.error("!!! ERROR LOGIN:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};