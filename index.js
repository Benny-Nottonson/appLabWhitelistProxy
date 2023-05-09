const express = require("express");
const app = express();
const PORT = process.env.PORT || 8000;

const routeHelloWorld = require('./routes/hello-world');
const routeProxy = require('./routes/proxy');

app.use('/hello-world', routeHelloWorld);
app.use('/proxy', routeProxy);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});