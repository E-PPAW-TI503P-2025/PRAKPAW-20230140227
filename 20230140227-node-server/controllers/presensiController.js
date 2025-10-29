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
                message: "Butuh userId dan nama di dalam body JSON" 
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
            userId: userId,     // <-- gunakan userId dari body
            nama: nama,         // <-- gunakan nama dari body
            checkIn: waktuSekarang,
        });
        
        // ... sisa kode respon sukses ...
        const formattedData = {
            userId: newRecord.userId,
            nama: newRecord.nama,
            // ... (dst)
        };
        res.status(201).json({
             message: `Halo ${nama}, check-in Anda berhasil...`,
             data: formattedData,
        });

    } catch (err) {
        next(err);
    }
};
 	
// GANTI SELURUH FUNGSI CHECKOUT KAMU DENGAN INI

exports.CheckOut = async (req, res, next) => { // <-- Tambahkan 'next'
    try {
      // 1. AMBIL 'userId' DARI REQ.BODY
      const { userId } = req.body; 

      // 2. Validasi
      if (!userId) {
          return res.status(400).json({ message: "userId diperlukan" });
      }

      const waktuSekarang = new Date();
  
      // 3. Cari data pakai 'userId' dari body
      const recordToUpdate = await Presensi.findOne({
        where: { 
            userId: userId, // <-- SUDAH DIGANTI
            checkOut: null 
        },
      });
  
      if (!recordToUpdate) {
        return res.status(404).json({
          message: "Tidak ditemukan catatan check-in yang aktif untuk Anda.",
        });
      }
  
      // 4. Update dan simpan
      recordToUpdate.checkOut = waktuSekarang;
      await recordToUpdate.save();
  
      const formattedData = {
          userId: recordToUpdate.userId,
          nama: recordToUpdate.nama, // Ambil nama dari data yg di-update
          checkIn: format(recordToUpdate.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
          checkOut: format(recordToUpdate.checkOut, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
      };
  
      res.json({
        // Ambil nama dari data yg di-update
        message: `Selamat jalan ${recordToUpdate.nama}, check-out Anda berhasil...`,
        data: formattedData,
      });

    } catch (error) {
      // 5. Gunakan next(error) agar ditangkap error handler di server.js
      next(error); 
    }
  };

exports.deletePresensi = async (req, res) => {
  try {
    const { id: userId } = req.user;
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
    res.status(204).send();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};




