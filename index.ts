import express, { Application } from 'express';
import routeHelloWorld from './routes/hello-world.js';
import routeProxy from './routes/proxy.js';

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '8000', 10);

app.use('/hello-world', routeHelloWorld);
app.use('/proxy', routeProxy);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});