const passport = require('passport')
const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
  res.render('users/register');
};

module.exports.register = async (req, res, next) => {
  const {username, email, password} = req.body;
  const user = new User({username, email});
  const registeredUser = await User.register(user, password);
  req.login(registeredUser, err => {
    if(err) return next(err);
    req.flash('success', 'ユーザー登録が完了しました');
    res.redirect('/spots');
  });
};

module.exports.renderLogin = (req, res) => {
  res.render('users/login');
};

module.exports.login = (req, res, next) => {
  const returnTo = req.session.returnTo; 
  passport.authenticate('local', (err, user) => {
    if (err) return next(err);
    if (!user) return res.redirect('/login');
    req.logIn(user, (err) => {
      if (err) return next(err);
      req.session.returnTo = returnTo; 
      const redirectUrl = req.session.returnTo || '/spots';
      delete req.session.returnTo; 
      req.flash('success', 'おかえりなさい');
      res.redirect(redirectUrl);
    });
  })(req, res, next);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
  req.flash('success', 'ログアウトしました');
    res.redirect('/spots');
  });
};