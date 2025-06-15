const express = require('express');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const pool = new Pool({
    user: process.env.DB_USER ?? 'postgres',
    host: 'localhost',
    database: process.env.DB_NAME ?? 'Sandy',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT ?? 5432,
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

module.exports = (io) => {
    const router = express.Router();

    // Get all conversations for current user
    router.get('/', verifyToken, async (req, res) => {
        const userId = req.user.id;

        try {
            const result = await pool.query(`SELECT 
                    c.id,
                    c.user1_id,
                    c.user2_id,
                    m.content AS latest_message,
                    m.timestamp AS latest_message_time,
                    u1.name as user1_name,
                    u2.name as user2_name
                FROM conversations c
                LEFT JOIN LATERAL (
                    SELECT content, timestamp
                    FROM messages
                    WHERE conversation_id = c.id
                    ORDER BY timestamp DESC
                    LIMIT 1
                ) m ON true
                LEFT JOIN users u1 ON c.user1_id = u1.id
                LEFT JOIN users u2 ON c.user2_id = u2.id
                WHERE c.user1_id = $1 OR c.user2_id = $1
                ORDER BY m.timestamp DESC NULLS LAST`,
                [userId]
            );

            res.json(result.rows);
        } catch (err) {
            console.error('Error fetching conversations:', err);
            res.status(500).json({
                error: 'Failed to fetch conversations',
                details: err.message
            });
        }
    });

    // Get or create a conversation between two users
    router.post('/', verifyToken, async (req, res) => {
        const userId1 = req.user.id;
        const userId2 = req.body.userId;

        if (!userId2 || userId1 === userId2) {
            return res.status(400).json({
                error: 'Invalid user ID'
            });
        }

        const [a, b] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

        try {
            let result = await pool.query(
                'SELECT * FROM conversations WHERE user1_id = $1 AND user2_id = $2',
                [a, b]
            );

            let conversation;
            if (result.rows.length === 0) {
                result = await pool.query(
                    'INSERT INTO conversations (user1_id, user2_id) VALUES ($1, $2) RETURNING *',
                    [a, b]
                );
            }

            conversation = result.rows[0];
            res.json(conversation);
        } catch (err) {
            res.status(500).json({
                error: 'Database error'
            });
        }
    });

    // Get messages from a conversation
    router.get('/:id', verifyToken, async (req, res) => {
        const conversationId = req.params.id;

        try {
            const messages = await pool.query(
                `SELECT messages.id, messages.content, messages.timestamp,
                    users.email AS sender_name, users.id AS sender_id
                FROM messages
                JOIN users ON users.id = messages.sender_id
                WHERE conversation_id = $1
                ORDER BY timestamp ASC`,
                [conversationId]
            );

            res.json(messages.rows);
        } catch (err) {
            res.status(500).json({
                error: 'Database error'
            });
        }
    });

    // Image upload endpoint for chat
    router.post('/upload', upload.single('image'), (req, res) => {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        // Return the URL relative to the backend server
        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({ url: fileUrl });
    });

    // Socket.IO handlers
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('No token provided'));

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            socket.user = decoded;
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.user.email}`);

        socket.on('join conversation', async ({
            conversationId
        }) => {
            socket.join(`conversation-${conversationId}`);

            const messages = await pool.query(
                `SELECT messages.id, messages.content, messages.timestamp,
                    users.email AS sender_name, users.id AS sender_id
                FROM messages
                JOIN users ON users.id = messages.sender_id
                WHERE conversation_id = $1
                ORDER BY timestamp ASC`,
                [conversationId]
            );

            socket.emit('chat history', {
                conversationId,
                messages: messages.rows
            });
        });

        socket.on('chat message', async ({
            conversationId,
            content
        }) => {
            const senderId = socket.user.id;

            if (!conversationId || !content) return;

            const insert = await pool.query(
                `INSERT INTO messages (conversation_id, sender_id, content)
                VALUES ($1, $2, $3) RETURNING *`,
                [conversationId, senderId, content]
            );

            const message = insert.rows[0];
            const sender = socket.user.email;

            io.to(`conversation-${conversationId}`).emit('chat message', {
                ...message,
                sender_name: sender
            });
        });
    });
    return router;
}