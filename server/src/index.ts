import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDatabase } from './db.js';
import usersRouter from './routes/users.js';
import datesRouter from './routes/dates.js';
import votesRouter from './routes/votes.js';
import summaryRouter from './routes/summary.js';
import adminRouter from './routes/admin.js'; // [NEW]
import progressRouter from './routes/progress.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '3001', 10);
const isProduction = process.env.NODE_ENV === 'production';

async function main() {
    // Adatbázis inicializálása
    await initDatabase();
    console.log('✅ SQLite adatbázis kész.');

    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json());

    // API routes
    app.use('/api/users', usersRouter);
    app.use('/api/dates', datesRouter);
    app.use('/api/votes', votesRouter);
    app.use('/api/summary', summaryRouter);
    app.use('/api/admin', adminRouter); // [NEW]
    app.use('/api/progress', progressRouter);

    // Production: statikus frontend kiszolgálás
    if (isProduction) {
        const distPath = path.join(__dirname, '..', '..', 'dist');
        app.use(express.static(distPath));
        app.get('*', (_req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    app.listen(PORT, () => {
        console.log(`🚀 Szerver fut: http://localhost:${PORT}`);
        console.log(`📁 Mód: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
    });
}

main().catch(err => {
    console.error('Szerver indítási hiba:', err);
    process.exit(1);
});
