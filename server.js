'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const nocache = require('nocache')
require('dotenv').config();

const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

const app = express();

app.use(nocache());
app.use(helmet({
  hidePoweredBy: {
    setTo: 'PHP 4.2.0',
  },
}));

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({ origin: '*' })); //USED FOR FCC TESTING PURPOSES ONLY!

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Index page (static HTML)
app.route('/')
    .get(function (req, res) {
      res.sendFile(process.cwd() + '/views/index.html');
    });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);

//404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404)
      .type('text')
      .send('Not Found');
});

const DEFAULT_PORT = 3000;

//Start our server and tests!
app.listen(process.env.PORT || DEFAULT_PORT, function () {
  console.log(`Listening on port ${process.env.PORT || DEFAULT_PORT}`);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        const error = e;
        console.log('Tests are not valid:');
        console.log(error);
      }
    }, 1500);
  }
});

module.exports = app; //for unit/functional testing
