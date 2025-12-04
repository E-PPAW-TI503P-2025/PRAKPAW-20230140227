'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Definisikan relasi di sini jika ada
      // Contoh: User.hasMany(models.Presensi, { foreignKey: 'userId' });
    }
  }

  User.init({
    nama: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'mahasiswa' // Default role jika tidak diisi
    }
  }, {
    sequelize,
    modelName: 'User', // Ini nama yang akan dipanggil di Controller (db.User)
  });

  return User;
};