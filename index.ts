import express, { Application } from 'express';
import routeHelloWorld from './routes/hello-world.js';
import routeProxy from './routes/proxy.js';
import routeHelloWorldTest from './routes/hello-world-test.js';

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '8000', 10);

app.use('/hello-world', routeHelloWorld);
app.use('/proxy', routeProxy);
app.use('/hello-world-test', routeHelloWorldTest);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});