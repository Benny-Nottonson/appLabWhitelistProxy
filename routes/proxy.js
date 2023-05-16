import express from 'express';
import bent from 'bent';
import convert from '../util/json-to-png.js';
import DupeChecker from '../util/dupe-checker.js';
const router = express.Router();
const dupeChecker = new DupeChecker();
const METHODS = new Set(['GET', 'HEAD', 'CONNECT', 'OPTIONS', 'TRACE']);
const METHODS_WITH_BODY = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);
async function badQuery(res) {
    res.type('png').send(await convert({ error: true, message: 'Bad query' }));
}
router.get('/:method/:url/*.png', async (req, res) => {
    if (!dupeChecker.check(req))
        return;
    const { method, url } = req.params;
    const queryBody = req.query.body;
    if (!METHODS.has(method))
        return badQuery(res);
    if (METHODS_WITH_BODY.has(method) && !queryBody)
        return badQuery(res);
    const decodedUrl = decodeURIComponent(url);
    console.log(`Proxy route accessed: ${method}: ${decodedUrl}`);
    try {
        const request = bent(method, 'json');
        const data = METHODS_WITH_BODY.has(method) && typeof queryBody === 'string' ? JSON.parse(decodeURIComponent(queryBody)) : undefined;
        const responseData = await request(decodedUrl, data);
        const png = await convert(responseData);
        res.type('png').send(png);
        console.log('Hello Proxy!');
    }
    catch (error) {
        console.log(error.message);
        res.type('png').send(await convert({ message: error.message }));
    }
});
export default router;
