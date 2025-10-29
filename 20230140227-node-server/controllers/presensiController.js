// 1. Ganti sumber data dari array ke model Sequelize
const { Presensi } = require("../models");
const { format } = require("date-fns-tz");
const timeZone = "Asia/Jakarta";

exports.CheckIn = async (req, res, next) => {
  try {
    // AMBIL DARI BODY UNTUK SEMENTARA
    const { userId, nama } = req.body;

    // Validasi sederhana
    if (!userId || !nama) {
      return res.status(400).json({
        message: "Butuh userId dan nama di dalam body JSON",
      });
    }

    // ... sisa kodenya sama ...
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
      userId: userId, // <-- gunakan userId dari body
      nama: nama, // <-- gunakan nama dari body
      checkIn: waktuSekarang,
    });

    // ... sisa kode respon sukses ...
    const formattedData = {
      userId: newRecord.userId,
      nama: newRecord.nama,
      checkIn: format(newRecord.checkIn, "yyyy-MM-dd HH:mm:ssXXX", {
        timeZone,
      }),
      checkOut: null, // Check-in baru, jadi checkOut masih null
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
        userId: userId, // <-- SUDAH DIGANTI
        checkOut: null,
      },
    });

    if (!recordToUpdate) {
      return res.status(404).json({
        message: "Tidak ditemukan catatan check-in yang aktif untuk Anda.",
      });
    }

   
    recordToUpdate.checkOut = waktuSekarang;
    await recordToUpdate.save();

    const formattedData = {
      userId: recordToUpdate.userId,
      nama: recordToUpdate.nama, // Ambil nama dari data yg di-update
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
         return res.status(400).json({ message: "userId diperlukan di body untuk otorisasi" });
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