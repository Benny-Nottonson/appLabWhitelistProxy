import { Router } from 'express';
import DupeChecker from '../util/dupe-checker.js';
import convert from '../util/json-to-png.js';
const router = Router();
const dupeChecker = new DupeChecker();
router.get('/*.png', async (req, res) => {
    if (!dupeChecker.check(req))
        return;
    try {
        const png = await convert({ message: 'Hello World' });
        res.type('png').send(png);
        console.log('Hello World!');
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(400).send(err.message);
        }
        else {
            res.status(400).send('An unknown error occurred');
        }
    }
});
export default router;
