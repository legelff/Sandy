var express = require('express');
var router = express.Router();
const usersRouter = require('./users');
const sittersRouter = require('./sitters');
const ownersRouter = require('./owners');

// Mount the routers
router.use('/users', usersRouter);
router.use('/sitters', sittersRouter);
router.use('/owners', ownersRouter);

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
