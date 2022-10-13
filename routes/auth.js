
const bodyParser = require('body-parser')
const express = require('express')
const router = express.Router()
const {isAuthenticatedUser}  = require('../middlewares/auth')
const { getUsers,
        registerUser,
        loginUser,
        forgotPassword,
        resetPassword,
        logout} = require('../controllers/authController')

router.route('/login').post(loginUser)
router.route('/users').get(getUsers)
router.route('/register').post(registerUser)
router.route('/password/forgot').post(forgotPassword)
router.route('/password/reset/:token').put(resetPassword)
router.route('/logout').get(isAuthenticatedUser,logout)
module.exports = router