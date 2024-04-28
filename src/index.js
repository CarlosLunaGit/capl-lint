require('dotenv').config();
const express = require('express');
// const bodyParser = require('body-parser');
const morgan = require('morgan');
// const cors = require('cors');
const {lintCode} = require('./core/lintCode.js');

console.log(process.env.NODE_ENV);

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// app.use(cors());
app.use(morgan('dev'));
// app.use(bodyParser.json());

app.post('/lint', async (req, res, next) => {
    console.log(req.body);
    const code = req.body.code;
    const errors = await lintCode(code);
    res.json({ errors });
    next;
});



// Only start listening when not in test environment
if (process.env.NODE_ENV !== 'test') {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}
// console.log('Exporting app:', app);
// Change here: Export app directly without listening
module.exports = app;