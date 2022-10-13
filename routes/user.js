
const bodyParser = require('body-parser')
const express = require('express')
const router = express.Router()
const  {
    getUserProfile,
    updateUserPassword,
    updateUser,
    deleteUser,
    getAppliedJobs,
    getPublishedJobs,
    getUsers,
    deleteUserByAdmin
    } = require('../controllers/userController')
const {isAuthenticatedUser,authorizeRole} = require('../middlewares/auth')


router.route('/user').get(isAuthenticatedUser,getUserProfile)

router.route('/jobs/applied').get(isAuthenticatedUser,getAppliedJobs)
router.route('/jobs/published').get(isAuthenticatedUser,authorizeRole('admin','employeer'),getPublishedJobs)

router.route('/password/change').put(isAuthenticatedUser,updateUserPassword)
router.route('/user/update').put(isAuthenticatedUser,updateUser)
router.route('/user/delete').delete(isAuthenticatedUser,deleteUser)


//Admin only routes
router.route('/admin/users').get(isAuthenticatedUser,authorizeRole('admin'),getUsers)
router.route('/admin/deleteuser/:id').delete(isAuthenticatedUser,authorizeRole('admin'),deleteUserByAdmin)
module.exports= router