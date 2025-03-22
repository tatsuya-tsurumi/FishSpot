const express = require('express');
const router = express.Router();
const multer  = require('multer');

const { storage } = require('../cloudinary');
const { isLoggedIn, isAuthor } = require('../middleware');
const upload = multer({ storage });
const spots = require('../controllers/spots');

router.route('/')
  .get(spots.index)
  .post((upload.array('image')), isLoggedIn, spots.createSpot);

//ここに書かないと下に記載のある「/:id」が先に認識されてしまい「/new」の前にエラーになる
router.get('/new', isLoggedIn, spots.renderNewForm);
router.get('/list', spots.showList);
  
router.route('/:id')
  .get(spots.showSpot)
  .put((upload.array('image')), isLoggedIn, isAuthor, spots.updateSpot)
  .delete(isLoggedIn, spots.deleteSpot);

router.get('/:id/edit', isLoggedIn, isAuthor, spots.renderEditForm);




module.exports = router;