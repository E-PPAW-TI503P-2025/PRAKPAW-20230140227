const { Presensi } = require("../models");
const { Op } = require("sequelize"); 
exports.getDailyReport = async (req, res, next) => { 
  try {
    
    const { nama, tanggalMulai, tanggalSelesai } = req.query;
    let options = { 
      where: {},
      order: [["checkIn", "DESC"]] 
    };

    
    if (nama) {
      options.where.nama = {
       
        [Op.iLike]: `%${nama}%`, 
      };
    }

    
    if (tanggalMulai && tanggalSelesai) {
      
      const startDate = new Date(tanggalMulai);
      const endDate = new Date(tanggalSelesai);

      endDate.setHours(23, 59, 59, 999);

      options.where.checkIn = { 
        [Op.between]: [startDate, endDate],
      };
    }

    const records = await Presensi.findAll(options);

    res.json({
      reportDate: new Date().toLocaleDateString(),
    
      filters: { 
        nama: nama || null, 
        tanggalMulai: tanggalMulai || null,
        tanggalSelesai: tanggalSelesai || null
      },
      data: records,
    });
  } catch (error) {

    next(error);
  }
};