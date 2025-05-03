import dotenv from 'dotenv';
dotenv.config();
import express, { json, urlencoded } from 'express';
import morgan from 'morgan';
import Linter from './core/linter.js';
import cors from 'cors';

const app = express();

// Use CORS middleware
app.use(cors());

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(morgan('dev'));




app.post('/lint', async (req, res, next) => {
    try {

        console.log(JSON.stringify(req.headers))

        const linter = new Linter();

        const code = req.body.code;

        // Parse and analyze the code
        const errors = linter.lint(code);

        // console.log(errors);// only for dev logs
        console.log(errors);// only for dev logs

        // Send response
        res.json( errors );
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
