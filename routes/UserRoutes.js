const express = require('express');
const { registerUser, loginUser, googleOAuthLogin, githubOAuthLogin } = require('../controller/UserController');
const router = express.Router();

router.post('/register-user' , registerUser)
router.post('/login-user' , loginUser)
router.post('/oauth-google' , googleOAuthLogin)
router.post('/oauth-github' , githubOAuthLogin)


module.exports = router;
