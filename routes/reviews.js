const express = require('express');
const router = express.Router({mergeParams: true});
const { isLoggedIn, isReviewAuthor } = require('../middleware');
const Reviews = require('../controllers/reviews');


router.post('/', isLoggedIn, Reviews.createReview);

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, Reviews.deleteReview);

module.exports = router;