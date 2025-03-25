import { wrapLambda } from 'convert-lambda-to-express';
import express from 'express';
import { handler } from './lambda/handler.js'

const app = express();


app.get('*', wrapLambda(handler, {region: 'eu-west-2', timeoutInSeconds: 3600}));
app.post('*', wrapLambda(handler, {region: 'eu-west-2', timeoutInSeconds: 3600}));

app.listen(8080, () => {
  console.log('Listening on port 8080');
});