const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const lintCode = require('./core/lintCode');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

app.post('/lint', (req, res) => {
    const code = req.body.code;
    // Placeholder for linting logic
    const errors = lintCode(code); // Implement this function based on your linting rules
    res.json({ errors });
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
