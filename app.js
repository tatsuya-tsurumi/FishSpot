//dotenvを使えるようにする。if文は本番環境用でなければという意味
//本番では別の方法で環境変数を使うため
if(process.env.NODE_ENV !== 'process') {
  require('dotenv').config();
};
const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const flash = require('connect-flash');
const mongoSanitize = require('express-mongo-sanitize');
const Joi = require('joi');
const helmet = require('helmet');

const User = require('./models/user');
const spotRoutes = require('./routes/spots');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');
const MongoStore = require('connect-mongo');
// const dbUrl = process.env.DB_URL
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/fish-spot';


// 'mongodb://localhost:27017/fish-spot'
mongoose.connect('mongodb://localhost:27017/fish-spot')
  .then(() => {
    console.log('MongoDBコネクションOK');
  })
  .catch(err => {
    console.log('MongoDBコネクションエラー');
    console.log(err);
  });

  const secret = process.env.SECRET || 'mysecret';

  const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
      secret,
      touchAfter: 24 * 3600 
    }
  });

  store.on('error', (e) => {
    console.log('セッションストアエラー', e);
  })

  const sessionConfig = {
    name: 'session',
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      // secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  }

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true}));
app.use(methodOverride('_method'));
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
// app.use(mongoSanitize({
//   replaceWith: '_',
// }),);
app.use(helmet());

const scriptSrcUrls = [
  'https://api.mapbox.com',
  'https://cdn.jsdelivr.net'
];
const styleSrcUrls = [
  'https://api.mapbox.com',
  'https://cdn.jsdelivr.net'
];
const connectSrcUrls = [
  'https://api.mapbox.com',
  'https://*.tiles.mapbox.com',
  'https://events.mapbox.com'
];
const fontSrcUrls = [];
const imgSrcUrls = [
  `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
  'https://images.unsplash.com'
];

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: [],
    connectSrc: ["'self'", ...connectSrcUrls],
    scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
    styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
    workerSor: ["'self'", "blob:"],
    childSrc: ["blob:"],
    objectSrc: [],
    imgSrc: ["'self'", 'blob:', 'data', ...imgSrcUrls],
    fontSrc: ["'self'", ...fontSrcUrls]
  }
}));

//passportに対してローカルストラテジーを使うと宣言してUserのauthenticateという方法でやると宣言
//authenticate()は宣言していないがpassportLocalMongooseのおかげで宣言しなくても使える
passport.use(new LocalStrategy(User.authenticate())); 
//セッションの中にユーザーの情報を詰め込む方法としてserializeUser()を使うと宣言
passport.serializeUser(User.serializeUser());
//セッションの中に入っている情報からユーザー情報を取り出す方法としてdeserializeUser()を使うと宣言
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

app.get('/', (req, res) => {
  res.render('home');
});

app.use('/spots', spotRoutes);
app.use('/', userRoutes);
app.use('/spots/:id/reviews', reviewRoutes);




const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`ポート${port}でリクエスト待受中`);
});