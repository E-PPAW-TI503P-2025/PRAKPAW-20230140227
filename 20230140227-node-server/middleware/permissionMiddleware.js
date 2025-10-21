exports.addUserData = (req, res, next) => {
    // normalize property names expected by controllers (they expect `id` and `nama`)
    console.log('User data added');
    req.user = { id: 123, nama: 'user karyawan', role: 'karyawan' };
    next();
};

exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        console.log('Access granted: Admin');
        next();
    } else {
        res.status(403).send('Access denied: Admins only');
    }
};