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

// POST /lint 200 33.054 ms - 164Ending Log Tail of existing logs ---Starting Live Log Stream ---
// 2024-07-14T20:23:42.099220500Z: [INFO]  {"accept":"application/json, text/plain, */*","host":"capllintserver.azurewebsites.net","user-agent":"axios/1.6.8","accept-encoding":"gzip, compress, deflate, br","cookie":"ARRAffinity=c82c30dbd554f70842d9b1bd407167e0fe5bf4a88594522e4dc923b169330686","max-forwards":"10","x-arr-log-id":"02f95929-b977-4c15-bd70-34c823e29a98","client-ip":"90.231.35.161:58520","x-client-ip":"90.231.35.161","disguised-host":"capllintserver.azurewebsites.net","x-site-deployment-id":"CAPLLintServer","was-default-hostname":"capllintserver.azurewebsites.net","x-forwarded-for":"90.231.35.161:58520","x-original-url":"/lint","x-waws-unencoded-url":"/lint","x-client-port":"58520","content-type":"application/x-www-form-urlencoded","content-length":"227"}

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
