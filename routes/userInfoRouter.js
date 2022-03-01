// import controllers 
const userInfoController = require('../controllers/userInfoController')
const userInfoValidator = require('../validators/userInfoValidator')

// router
const router = require('express').Router()

// use routers

router.get('/', userInfoController.index);

router.post('/auth', userInfoController.auth)

router.get('/addUser', userInfoController.getAddUser);

router.post('/addUser', userInfoController.upload, userInfoValidator.checkUser, userInfoController.addUser)

router.get('/allUsers', userInfoController.getAllUsers)

router.get('/edit/:id', userInfoController.getOneUser)

router.post('/edit/:id', userInfoController.upload, userInfoValidator.checkUser, userInfoController.updateUser)

router.get('/delete/:id', userInfoController.deleteUser)

module.exports = router
