import dotenv from 'dotenv';
dotenv.config();
import express, { json, urlencoded } from 'express';
// const bodyParser = require('body-parser');
import morgan from 'morgan';
// const cors = require('cors');
import {Parser} from './parser/parser.js';

console.log(process.env.NODE_ENV);

const app = express();
app.use(json())
app.use(urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// app.use(cors());
app.use(morgan('dev'));
// app.use(bodyParser.json());

app.post('/lint', async (req, res, next) => {
    const parser = new Parser();
    console.log(req.body);
    const code = req.body.code;
    // const errors = await lintCode(code);
    // let normalized = code.replace(/\\r\\n/g, '\n');
    const parserHandler = parser.parse(code);
    parserHandler.mainLoop();
    console.log(parserHandler.errors);
    console.log(parserHandler.sysErrors);
    const errors = parserHandler.errors;
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
export default app;