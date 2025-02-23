import { wrapLambda } from 'convert-lambda-to-express';
import express from 'express';
import { handler } from './lambda/handler.js'

const app = express();

//@ts-expect-error
app.get('*', wrapLambda(handler, {region: 'eu-west-2'}));
//@ts-expect-error
app.post('*', wrapLambda(handler, {region: 'eu-west-2'}));

app.listen(8080, () => {
  console.log('Listening on port 8080');
});