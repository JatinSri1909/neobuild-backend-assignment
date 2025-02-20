const express = require('express');
const connectDB = require('./database');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const resumeRoutes = require('./routes/resume.routes');
const app = express();
const port = process.env.PORT || 5000;

// connect to database
connectDB()

// middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);

// Serve static files
app.use(express.static('public'));

// Update root route to serve HTML file
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: './public' });
});

// basic error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})
