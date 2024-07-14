import dotenv from 'dotenv';
dotenv.config();
import express, { json, urlencoded } from 'express';
import morgan from 'morgan';
import { Parser } from './parser/parser.js';
import cors from 'cors';

const app = express();

// Use CORS middleware
app.use(cors());

// const corsOptions = {
//     origin: 'https://www.nileshblog.tech/',//(https://your-client-app.com)
//     optionsSuccessStatus: 200,
//   };

//   app.use(cors(corsOptions));

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(morgan('dev'));




app.post('/lint', async (req, res, next) => {
    try {
        // const origin = req.get('origin');
        // console.log(origin);
        console.log(JSON.stringify(req.headers))

        const parser = new Parser();
        // console.log(req.body);// only for dev logs
        const code = req.body.code;

        // Parse and analyze the code
        const parserHandler = parser.parse(code);
        parserHandler.mainLoop();

        // Collect errors
        const errors = parserHandler.errors;

        // console.log(errors);// only for dev logs
        // console.log(parserHandler.sysErrors);// only for dev logs

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
