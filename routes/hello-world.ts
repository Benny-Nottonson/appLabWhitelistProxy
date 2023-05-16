import { Router, Request, Response } from 'express';
import DupeChecker from '../util/dupe-checker.js';
import convert from '../util/json-to-png.js';

const router: Router = Router();
const dupeChecker: DupeChecker = new DupeChecker();
const pngRegex: RegExp = /\.png$/;

router.get(pngRegex, async (req: Request, res: Response): Promise<void> => {
  if (!dupeChecker.check(req)) return;

  try {
    const png: Buffer = await convert({ message: 'Hello World' });
    res.type('png').send(png);
  } catch (err) {
    if (err instanceof Error) {
      res.type('png').send(await convert({message: err.message}));
    } else {
      res.type('png').send(await convert({message: 'An unknown error occurred'}));
    }
  }
});

export default router;