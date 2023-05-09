const express = require('express');
const jsonToPng = require('../util/json-to-png');
const DupeChecker = require('../util/dupe-checker');

const router = express.Router();
const dupeChecker = new DupeChecker();

router.get('/*.png', async (req, res) => {
  if (!dupeChecker.check(req)) return;

  try {
    const png = await jsonToPng.convert({ message: 'Hello World' });
    res.type('png').send(png);
    console.log('Hello World!');
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;