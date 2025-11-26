const { Presensi, User, Sequelize } = require('../models');
const { Op } = Sequelize;


const checkIn = async (req, res) => {
  try {
     
    const userId = req.user.id; 
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingPresensi = await Presensi.findOne({
      where: {
        userId,
        checkIn: {
          [Op.between]: [startOfDay, endOfDay]
        }
      }
    });

    if (existingPresensi) {
      return res.status(400).json({ message: "Anda sudah melakukan Check-In hari ini." });
    }

     
    const presensi = await Presensi.create({
      userId,
      checkIn: new Date(),
       
    });

    res.status(201).json({
      message: "Berhasil Check-In!",
      data: presensi
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server saat Check-In." });
  }
};

 
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
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server saat Check-Out." });
  }
};

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
        nama: {
          [Op.like]: `%${nama}%`  
        }
      };
    }

  
    const reports = await Presensi.findAll(options);

    res.status(200).json(reports);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil data laporan." });
  }
};

 
module.exports = {
  checkIn,
  checkOut,
  getLaporan
};