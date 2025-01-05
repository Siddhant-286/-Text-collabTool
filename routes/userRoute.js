const express = require('express');
const userController = require("../controllers/userController");
const router = express.Router();
const checkUser = require('../utils/checkUser');
// POST: Register a new user
router.post('/register', userController.register);

// POST: Login a user
router.post('/login', userController.login);

// POST: Logout a user
router.post('/logout', checkUser,userController.logout);

router.post('/verify-session', checkUser, userController.verifySession);


module.exports = router;