import { wrapLambda } from 'convert-lambda-to-express';
import express from 'express';
import { handler } from './lambda/handler.js'
import bodyParser from 'body-parser';

const app = express();
var jsonParser = bodyParser.json()
 
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(jsonParser)
app.use(urlencodedParser)

//@ts-expect-error
app.get('*', wrapLambda(handler, {region: 'eu-west-2', timeoutInSeconds: 3600}));
//@ts-expect-error
app.post('*', wrapLambda(handler, {region: 'eu-west-2', timeoutInSeconds: 3600}));

app.listen(8080, () => {
  console.log('Listening on port 8080');
});