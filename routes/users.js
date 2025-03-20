const express = require('express');
const router = express.Router();
const Users = require('../controllers/users');

router.route('/register')
  .get(Users.renderRegister)
  .post(Users.register);

  router.route('/login')
  .get(Users.renderLogin)
  .post(Users.login);

router.get('/logout', Users.logout)

module.exports = router;