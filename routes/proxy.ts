import express, { Request, Response } from 'express';
import bent from 'bent';
import convert from '../util/json-to-png.js';
import DupeChecker from '../util/dupe-checker.js';

const router = express.Router();
const dupeChecker = new DupeChecker();

interface Method {
  type: string;
  body: boolean;
}

const METHODS: Method[] = [
  { type: 'GET', body: false },
  { type: 'HEAD', body: false },
  { type: 'POST', body: true },
  { type: 'PUT', body: true },
  { type: 'DELETE', body: true },
  { type: 'CONNECT', body: false },
  { type: 'OPTIONS', body: false },
  { type: 'TRACE', body: false },
  { type: 'PATCH', body: true },
];

function badQuery(res: Response): void {
  res.send({ error: true, message: 'Bad query' });
}

router.get('/:method/:url/*.png', async (req: Request, res: Response) => {
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
    const data = validMethod.body && typeof queryBody === 'string' ? JSON.parse(decodeURIComponent(queryBody)) : undefined;
    const responseData = await request(decodedUrl, data);
    const png = await convert(responseData);

    res.type('png').send(png);

    console.log('Hello Proxy!');
  } catch (error: any) {
    res.status(400).send(error.message);
  }
});

export default router;