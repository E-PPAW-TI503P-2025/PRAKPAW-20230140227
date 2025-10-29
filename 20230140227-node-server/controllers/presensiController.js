// 1. Impor module yang diperlukan
const { Presensi, Sequelize } = require("../models"); // Impor Sequelize
const { Op } = Sequelize; // Impor Op (Operators) dari Sequelize
const { format } = require("date-fns-tz");
const timeZone = "Asia/Jakarta";
const { validationResult } = require('express-validator');


exports.CheckIn = async (req, res, next) => {
  try {
    const { userId, nama } = req.body;

    // Validasi sederhana
    if (!userId || !nama) {
      return res.status(400).json({
        message: "Butuh userId dan nama di dalam body JSON",
      });
    }

    const waktuSekarang = new Date();
    const existingRecord = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
    });

    if (existingRecord) {
      return res
        .status(400)
        .json({ message: "Anda sudah melakukan check-in hari ini." });
    }

    const newRecord = await Presensi.create({
      userId: userId, 
      nama: nama, 
      checkIn: waktuSekarang,
    });

    const formattedData = {
      userId: newRecord.userId,
      nama: newRecord.nama,
      checkIn: format(newRecord.checkIn, "yyyy-MM-dd HH:mm:ssXXX", {
        timeZone,
      }),
      checkOut: null, 
    };

    res.status(201).json({
      message: `Halo ${nama}, check-in Anda berhasil...`,
      data: formattedData,
    });
  } catch (err) {
    next(err);
  }
};

exports.CheckOut = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId diperlukan" });
    }

    const waktuSekarang = new Date();

    const recordToUpdate = await Presensi.findOne({
      where: {
        userId: userId,
        checkOut: null,
      },
    });

    if (!recordToUpdate) {
      // Perbaikan Typo 4404
      return res.status(404).json({ 
        message: "Tidak ditemukan catatan check-in yang aktif untuk Anda.",
      });
    }

    recordToUpdate.checkOut = waktuSekarang;
    await recordToUpdate.save();

    const formattedData = {
      userId: recordToUpdate.userId,
      nama: recordToUpdate.nama,
      checkIn: format(recordToUpdate.checkIn, "yyyy-MM-dd HH:mm:ssXXX", {
        timeZone,
      }),
      checkOut: format(recordToUpdate.checkOut, "yyyy-MM-dd HH:mm:ssXXX", {
        timeZone,
      }),
    };

    res.json({
      message: `Selamat jalan ${recordToUpdate.nama}, check-out Anda berhasil...`,
      data: formattedData,
    });
  } catch (error) {
    next(error);
  }
};

exports.DeletePresensi = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res
        .status(400)
  _       .json({ message: "userId diperlukan di body untuk otorisasi" });
    }

    const presensiId = req.params.id;
    const recordToDelete = await Presensi.findByPk(presensiId);

    if (!recordToDelete) {
      return res
        .status(404)
        .json({ message: "Catatan presensi tidak ditemukan." });
    }

    if (recordToDelete.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Akses ditolak: Anda bukan pemilik catatan ini." });
    }

    await recordToDelete.destroy();

    res.status(200).json({ message: "Data presensi berhasil dihapus." });
  } catch (error) {
    next(error);
  }
};

exports.UpdatePresensi = async (req, res, next) => {
  try {
    // Cek hasil validasi dari express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const presensiId = req.params.id;
    const { checkIn, checkOut, nama } = req.body;

    if (checkIn === undefined && checkOut === undefined && nama === undefined) {
      return res.status(400).json({
        message:
          "Request body tidak berisi data yang valid untuk diupdate (checkIn, checkOut, atau nama).",
      });
    }

    const recordToUpdate = await Presensi.findByPk(presensiId);
    if (!recordToUpdate) {
      return res
        .status(404)
        .json({ message: "Catatan presensi tidak ditemukan." });
    }

    recordToUpdate.checkIn = checkIn || recordToUpdate.checkIn;
    recordToUpdate.checkOut = checkOut || recordToUpdate.checkOut;
    recordToUpdate.nama = nama || recordToUpdate.nama;

    await recordToUpdate.save();

    res.json({
      message: "Data presensi berhasil diperbarui.",
      data: recordToUpdate,
    });
  } catch (error) {
    next(error);
  } // Perbaikan: Huruf 'S' (SyntaxError) sudah dihapus dari sini
};

// Fungsi untuk GET / (Search by name)
exports.FindAll = async (req, res, next) => {
  try {
    const { nama } = req.query;

    const options = {
      order: [["checkIn", "DESC"]], 
      where: {} 
    };

    if (nama) {
      options.where.nama = {
        // PERBAIKAN: Mengganti Op.iLike (PostgreSQL) menjadi Op.like (MySQL)
        [Op.like]: `%${nama}%`,
      };
    }

    const records = await Presensi.findAll(options);

    res.status(200).json(records);
    
  } catch (error) {
    next(error);
  }
};