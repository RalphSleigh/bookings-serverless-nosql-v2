/* const app = express();
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
 */

import express from 'express'
import { router } from './lambda/app.js'

const localApp = express()

localApp.use('/api', router)

localApp.listen(8080, () => {
  console.log('Listening on port 8080')
})
