require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
require('./config/db');
const http = require('http');
const { Server } = require('socket.io');


const app = express();
const server = http.createServer(app);

// create socket.io server
const io = new Server(server, {
  cors: { origin: '*' },
  path: '/socket.io/'
});




const authRouter = require('./routes/auth');
const petsRouter = require('./routes/pets');
const reviewsRouter = require('./routes/reviews');
const userRouter = require('./routes/users');

const searchRouter = require('./routes/search');
const homeRouter = require('./routes/home');
const sitterRouter = require('./routes/sitter');
const optionsRouter = require('./routes/options');
const bookingRouter = require('./routes/booking');
const chatRouter = require('./routes/chat')(io);



const PORT = process.env.PORT

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({ extended: true }));



app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/pets', petsRouter);
app.use('/reviews', reviewsRouter);
app.use('/search', searchRouter);
app.use('/home', homeRouter);
app.use('/sitter', sitterRouter);
app.use('/options', optionsRouter);
app.use('/booking', bookingRouter);
app.use('/chat', chatRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Pet Care API is running!');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 500,
    message: 'Internal Server Error'
  });
});

module.exports = { server, app };
