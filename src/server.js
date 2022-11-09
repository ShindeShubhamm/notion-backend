const axios = require('axios');
const cors = require('cors');
const express = require('express');
const serverless = require('serverless-http');
const { dataToBase64 } = require('./utils/helpers');
const { Client } = require('@notionhq/client');

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

router.get('/', (req, res) => {
    res.send({ message: 'Hello world!' });
});

router.get('/env', (req, res) => {
    const clientId = process.env.NOTION_OAUTH_CLIENTID;
    const clientSecret = process.env.NOTION_OAUTH_CLIENTSECRET;
    res.send({ clientId, clientSecret });
});

router.post('/accesstoken', cors(corsOptions), async (req, res) => {
    const { code } = req.body;
    const clientId = process.env.NOTION_OAUTH_CLIENTID;
    const clientSecret = process.env.NOTION_OAUTH_CLIENTSECRET;
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
        res.status(error.response?.status).send({ error: error.response });
    }
});

router.get(
    '/block_content/:blockId/children',
    cors(corsOptions),
    async (req, res) => {
        const client = new Client({
            auth: req.headers.authorization.replace('Bearer ', ''),
        });
        try {
            const pageData = await client.blocks.children.list({
                block_id: req.params.blockId,
            });
            res.send(pageData.results);
        } catch (error) {
            console.log(error);
        }
    }
);

// router.get('/pages/:pageId/tabledata', cors(corsOptions), async (req, res) => {
//     const client = new Client({
//         auth: req.headers.authorization.replace('Bearer ', ''),
//     });
//     try {
//         const pageData = await client.blocks.children.list({
//             block_id: req.params.pageId,
//         });
//     } catch (error) {

//     }
// })

router.get('/search', cors(corsOptions), async (req, res) => {
    const client = new Client({
        auth: req.headers.authorization.replace('Bearer ', ''),
    });
    const searchData = await client.search();
    res.send(searchData);
});

app.use('/', router);
app.use('/.netlify/functions/server', router);

module.exports = app;
module.exports.handler = serverless(app);
