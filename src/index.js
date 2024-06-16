import dotenv from 'dotenv';
dotenv.config();
import express, { json, urlencoded } from 'express';
import morgan from 'morgan';
import { Parser } from './parser/parser.js';

const app = express();
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(morgan('dev'));

app.post('/lint', async (req, res, next) => {
    try {
        const parser = new Parser();
        console.log(req.body);
        const code = req.body.code;

        // Parse and analyze the code
        const parserHandler = parser.parse(code);
        parserHandler.mainLoop();

        // Collect errors
        const errors = parserHandler.errors;

        console.log(errors);
        console.log(parserHandler.sysErrors);

        // Send response
        res.json({ errors });
    } catch (error) {
        console.error('Error during linting:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    next();
});

if (process.env.NODE_ENV !== 'test') {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

export default app;
