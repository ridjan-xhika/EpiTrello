const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to EpiTrello API' });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;