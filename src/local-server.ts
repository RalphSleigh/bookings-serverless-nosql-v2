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

app.use((req, res, next) => {    //runs for every path. Same as .use('/',
  //'/hello' has NOT been trimmed from req.url
  //req.url is /hello if the request was for /hello
  if (req.url.startsWith('/api')) { 
    req.url = req.url.substring(4); //remove /api from the start of the url
  }
  next(); //will continue calling all middleware
});

//@ts-expect-error
app.get('*', wrapLambda(handler, {region: 'eu-west-2', timeoutInSeconds: 3600}));
//@ts-expect-error
app.post('*', wrapLambda(handler, {region: 'eu-west-2', timeoutInSeconds: 3600}));

app.listen(8080, () => {
  console.log('Listening on port 8080');
});