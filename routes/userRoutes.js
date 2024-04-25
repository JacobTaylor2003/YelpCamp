const express = require('express');
const router = express.Router();
const passport = require('passport')
const User = require('../models/user');
const wrapSync = require('../utilities/wrapSync');
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/user');

router.route('/register')

router.get('/register', users.renderRegisterForm);

router.post('/register', wrapSync(users.createRegister));

router.get('/login', users.renderLogin);

router.post('/login',storeReturnTo,passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.createLogin);

router.get('/logout', users.logout);

module.exports = router;