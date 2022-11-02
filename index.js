const axios = require('axios');
const cors = require('cors');
const express = require('express');
const { dataToBase64 } = require('./utils/helpers');

const app = express();
const port = 1337;

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

app.get('/', cors(corsOptions), (req, res) => {
    res.send({ message: 'Hello world!' });
});

app.post('/accesstoken', cors(corsOptions), async (req, res) => {
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
        res.status(500).send(error);
    }
});

app.listen(port, () => {
    console.log(`> app started on port: ${port}`);
});

module.exports;
