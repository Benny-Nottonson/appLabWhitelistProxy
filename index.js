import express from "express";
const app = express();
const PORT = process.env.PORT || 8000;

import routeHelloWorld from './routes/hello-world.js';
import routeProxy from './routes/proxy.js';

app.use('/hello-world', routeHelloWorld);
app.use('/proxy', routeProxy);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});