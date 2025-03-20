const Spot = require('./models/spot');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
  if(!req.isAuthenticated()) {
    //もともと飛びたかった場所を保存しておく
    //originalUrlはパス情報が入っている。return Toという名前でセッションに保存する
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'ログインしてください');
    return res.redirect('/login');
  }
  next();
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const spot = await Spot.findById(id);
  if(!spot.author.equals(req.user._id)) {
    req.flash('error', 'そのアクションの権限がありません');
    return res.redirect(`/spots/${id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const {id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if(!review.author.equals(req.user._id)) {
    req.flash('error', 'そのアクションの権限がありません');
    return res.redirect(`/spots/${id}`);
  }
  next();
};