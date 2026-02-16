import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Feltöltési könyvtár konfigurálása
const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads'); // server/public/uploads -> ../../public/uploads ??
// Wait, structure is:
// root/server/src/routes/upload.ts
// root/server/public/uploads (standard) OR root/public/uploads?
// The PHP version used `server/public/uploads`. Let's stick to that.
// BUT `npm run dev` in `server` serves from `server` root.
// If I put it in `server/public/uploads`, I need to make sure express serves it static.

// Correct path relative to this file:
// server/src/routes/upload.ts -> ../../public/uploads = server/public/uploads
const serverPublicDir = path.join(__dirname, '..', '..', 'public');
const uploadsDir = path.join(serverPublicDir, 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Egyedi fájlnév: timestamp + eredeti név (tisztítva)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'img-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Csak képfájlok tölthetők fel!'));
        }
    }
});

// POST /api/upload
router.post('/', upload.array('images', 10), (req, res) => {
    try {
        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'Nem történt fájlfeltöltés.' });
        }

        // URL generálás (feltételezve, hogy a 'public' mappa statikusan kiszolgált)
        // Ha a szerver a 'public' mappát '/' útvonalon szolgálja ki, akkor '/uploads/filename' a jó.
        const fileUrls = files.map(file => `/uploads/${file.filename}`);

        res.json({
            success: true,
            message: `${files.length} fájl feltöltve.`,
            files: fileUrls
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Feltöltési hiba.' });
    }
});

export default router;
