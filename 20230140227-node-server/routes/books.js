const express = require('express');
const router = express.Router();

// Data buku di dalam memori (sebagai database sementara)
let books = [
  {id: 1, title: 'Book 1', author: 'Author 1'},
  {id: 2, title: 'Book 2', author: 'Author 2'}
];

// GET semua buku
router.get('/', (req, res) => {
  res.json(books);
});

// GET satu buku berdasarkan ID
router.get('/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).send('Book not found');
  res.json(book);
});

// POST untuk menambahkan buku baru
router.post('/add', (req, res) => {
  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).json({ message: 'Title and author are required' });
  }
  const book = {
    id: books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1, // Pastikan ID unik
    title,
    author
  };
  books.push(book);
  res.status(201).json(book);
});

// PUT untuk memperbarui buku berdasarkan ID
router.put('/:id', (req, res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if (!book) return res.status(404).send('Book not found');

    const { title, author } = req.body;
    // Validasi input
    if (!title || !author) {
        return res.status(400).json({ message: 'Title and author are required for update' });
    }

    // Perbarui data buku
    book.title = title;
    book.author = author;
    
    res.json(book);
});

// DELETE untuk menghapus buku berdasarkan ID
router.delete('/:id', (req, res) => {
    const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id));
    if (bookIndex === -1) return res.status(404).send('Book not found');

    // Hapus buku dari array dan kirim kembali buku yang dihapus
    const deletedBook = books.splice(bookIndex, 1);
    res.json({ message: 'Book successfully deleted', book: deletedBook[0] });
});

module.exports = router;
