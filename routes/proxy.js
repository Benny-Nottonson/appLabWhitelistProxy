const express = require('express');
const bent = require('bent');
const jsonToPng = require('../util/json-to-png');
const DupeChecker = require('../util/dupe-checker');

const router = express.Router();
const dupeChecker = new DupeChecker();

const METHODS = [
  { type: 'GET', body: false },
  { type: 'HEAD', body: false },
  { type: 'POST', body: true },
  { type: 'PUT', body: true },
  { type: 'DELETE', body: true },
  { type: 'CONNECT', body: false },
  { type: 'OPTIONS', body: false },
  { type: 'TRACE', body: false },
  { type: 'PATCH', body: true }
];

function badQuery(res) {
  res.send({ error: true, message: 'Bad query' });
}

router.get('/:method/:url/*.png', async (req, res) => {
  if (!dupeChecker.check(req)) return;
  
  const { method, url } = req.params;
  const queryBody = req.query.body;
  
  const validMethod = METHODS.find(m => m.type === method);
  if (!validMethod) return badQuery(res);
  
  if (validMethod.body && !queryBody) return badQuery(res);

  const decodedUrl = decodeURIComponent(url);
  console.log(`Proxy route accessed: ${method}: ${decodedUrl}`);

  try {
    const request = bent(validMethod.type, 'json');
    const data = validMethod.body ? JSON.parse(decodeURIComponent(queryBody)) : undefined;
    const responseData = await request(decodedUrl, data);
    const png = await jsonToPng.convert(responseData);

    res.type('png');
    res.send(png);

    console.log('Hello Proxy!');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;