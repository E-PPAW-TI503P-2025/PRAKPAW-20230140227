const { Presensi, User, Sequelize } = require('../models');
const { Op } = Sequelize;
const multer = require('multer');
const path = require('path');

// --- KONFIGURASI MULTER (UPLOAD FOTO) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Pastikan folder 'uploads' sudah ada di root project
  },
  filename: (req, file, cb) => {
    // Format nama file: userId-timestamp.ext
    // Contoh: 12-1715629999.jpg
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
  }
};

// DEFINISIKAN VARIABEL UPLOAD DISINI
const upload = multer({ storage: storage, fileFilter: fileFilter });


// --- FUNGSI CONTROLLER ---

// 1. FUNGSI CHECK-IN (Dengan Lokasi & Foto)
const checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const { latitude, longitude } = req.body;
    
    // Ambil path foto jika ada yang diupload
    const buktiFoto = req.file ? req.file.path : null; 

    // Cek Double Check-In
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingPresensi = await Presensi.findOne({
      where: {
        userId,
        checkIn: { [Op.between]: [startOfDay, endOfDay] }
      }
    });

    if (existingPresensi) {
      return res.status(400).json({ message: "Anda sudah melakukan Check-In hari ini." });
    }

    // Simpan ke Database
    const presensi = await Presensi.create({
      userId,
      checkIn: new Date(),
      latitude,
      longitude,
      buktiFoto // Simpan path foto (misal: uploads/1-12345.jpg)
    });

    res.status(201).json({
      message: "Berhasil Check-In!",
      data: presensi
    });

  } catch (error) {
    console.error("Error CheckIn:", error);
    res.status(500).json({ message: "Terjadi kesalahan server saat Check-In." });
  }
};

// 2. FUNGSI CHECK-OUT
const checkOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const presensi = await Presensi.findOne({
      where: {
        userId,
        checkIn: { [Op.gte]: startOfDay },
        checkOut: null
      }
    });

    if (!presensi) {
      return res.status(404).json({ message: "Anda belum Check-In hari ini atau sudah Check-Out." });
    }

    presensi.checkOut = new Date();
    await presensi.save();

    res.status(200).json({
      message: "Berhasil Check-Out!",
      data: presensi
    });

  } catch (error) {
    console.error("Error CheckOut:", error);
    res.status(500).json({ message: "Terjadi kesalahan server saat Check-Out." });
  }
};

// 3. FUNGSI LAPORAN
const getLaporan = async (req, res) => {
  try {
    const { nama } = req.query;

    let options = {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nama', 'email']
        }
      ],
      order: [['checkIn', 'DESC']]
    };

    if (nama) {
      options.include[0].where = {
        nama: { [Op.like]: `%${nama}%` }
      };
    }

    const reports = await Presensi.findAll(options);
    res.status(200).json(reports);

  } catch (error) {
    console.error("Error GetLaporan:", error);
    res.status(500).json({ message: "Gagal mengambil data laporan." });
  }
};

module.exports = {
  upload,     
  checkIn,
  checkOut,
  getLaporan
};