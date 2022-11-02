const axios = require('axios');
const cors = require('cors');
const express = require('express');
const serverless = require('serverless-http');
const { dataToBase64 } = require('./utils/helpers');

const app = express();
const router = express.Router();

app.use(express.json());

// CORS
app.use(cors());
const whitelist = [
    'http://localhost:3000',
    'https://notion-spreadsheets.netlify.app',
];
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
};

const clientId = process.env.NOTION_OAUTH_CLIENTID;
const clientSecret = process.env.NOTION_OAUTH_CLIENTSECRET;

router.get('/', (req, res) => {
    res.send({ message: 'Hello world!' });
});

router.get('/env', (req, res) => {
    res.send({ clientId, clientSecret });
});

router.post('/accesstoken', async (req, res) => {
    const { code } = req.body;
    const auth = dataToBase64(`${clientId}:${clientSecret}`);
    try {
        const response = await axios.post(
            'https://api.notion.com/v1/oauth/token',
            {
                code,
                grant_type: 'authorization_code',
                redirect_uri: 'http://localhost:3000',
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${auth}`,
                },
            }
        );
        res.send(response.data);
    } catch (error) {
        res.status(error.response.status).send({ error: error.response });
    }
});

app.use('/', router);
app.use('/.netlify/functions/server', router);

module.exports = app;
module.exports.handler = serverless(app);
