require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const lintCode = require('./core/lintCode');

console.log(process.env.NODE_ENV);
const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

app.post('/lint', (req, res) => {
    const code = req.body.code;
    const errors = lintCode(code);
    res.json({ errors });
});

// Change here: Export app directly without listening
module.exports = app;

// Only start listening when not in test environment
if (process.env.NODE_ENV !== 'test') {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}
