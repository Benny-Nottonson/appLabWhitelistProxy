import { Router, Request, Response } from 'express';
import DupeChecker from '../util/dupe-checker.js';
import convert from '../util/json-to-png.js';

const router = Router();
const dupeChecker = new DupeChecker();

router.get('/*.png', async (req: Request, res: Response) => {
  if (!dupeChecker.check(req)) return;

  try {
    const png = await convert({ message: 'Hello World' });
    res.type('png').send(png);
    console.log('Hello World!');
  } catch (err: any) {
    res.status(400).send(err.message);
  }
});

export default router;