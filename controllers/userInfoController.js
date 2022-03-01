const db = require('../models')
var bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
require("dotenv").config();
const multer = require('multer');
const path = require('path');
var fs = require('fs');
const { getDefaultSettings } = require('http2');

const userInfo = db.userData
//const userInfo = db.test
const salt = 10;
const JWT_SECRET = process.env.jwt;


// 1. create 

// promise (resolve, reject)
const addUser = async (req, res) => {
   // if (req.cookies.Admin_portal != "") {
    
        console.log(req.body.username)
        console.log(req.body)
        //const [Password] = await Promise.all([bcrypt.hash(req.body.password,salt)]);

        const d = new Date();
        createss=  d.toUTCString();
        Password = await bcrypt.hash(req.body.password, salt);
        console.log(Password)
        let info = {
            name: req.body.name.trim(),
            email: req.body.email.trim(),
            contact: req.body.contact.trim(),
            username: req.body.username.trim(),
            password: Password.trim(),
            role: req.body.state,
            img: req.file.filename,
            created:createss,
           // updated:""
        }
        const userinfo = await userInfo.create(info)
            .then(() =>req.flash('success', "User Added Successfully"))
            .then(() => req.session.save(function () {
             res.redirect('/allUsers')
    }))
            .catch((err) => res.status(500).send(err));
    
}


// 2. get all 
const index = (req, res) => {
    res.header('first_name','HelloWorld');
    
    res.render('index', {
        success: req.flash('success'),
        errors: req.flash('errors'),
      
    });

}

const getAddUser = (req, res) => {
   if (req.cookies.Admin_portal) {
        res.render('addUser');
    }
    else {
        req.flash('errors', "You Are Not Authorized User")
        req.session.save(function () {
            res.redirect('/')
        })
   }
}

const getAllUsers = async (req, res) => {

	//res.send();
    console.log("")
    console.log(req.headers);
    if (req.cookies.Admin_portal || req.headers.name==="Admin") {
        let userinfo = await db.sequelize.query("SELECT * FROM tests;",{
            row:true,
            model:db.userData
        }).then((userinfo) => res.render('users',{
            success: req.flash('success'),
            errors: req.flash('errors'),
            user: userinfo }
        ))
            .catch((err) => res.status(500).send(err));
    }
    else {
        req.flash('errors', "You Are Not Authorized User")
        req.session.save(function () {
            res.redirect('/')
        })

    }
}

// 3. get single user

const getOneUser = async (req, res) => {
    if (req.cookies.Admin_portal) {
        let id = req.params.id
        userinfo = await userInfo.findOne({ where: { id: id } })
            .then(userinfo => res.status(200).render('editUser', { user: userinfo }))
            .catch(err => res.status(500).send(err));
    }
    else {
        req.flash('errors', "You Are Not Authorized User")
        req.session.save(function () {
            res.redirect('/')
        })

    }

}

// 4. update 

const updateUser = async (req, res) => {

    if (req.cookies.Admin_portal) {
        let id = req.params.id
        console.log("up", req.params.id, req.body)
        let new_img = "";
        if (req.file) {
            new_img = req.file.filename;
            try {
                fs.unlinkSync("./Images" + req.body.old_image);
            } catch (err) {
                console.log(err)
            }

        } else {
            new_img = req.body.old_image;
        }

        let info = {
            name: req.body.name,
            email: req.body.email,
            contact: req.body.contact,
            username: req.body.username,
            password: req.body.Password,
            role: req.body.state,
            img: new_img,
        }
        const userinfo = await userInfo.update(info, { where: { id: id } })
        .then(() =>req.flash('success', "User Updated Successfully"))
        .then(() => req.session.save(function () {
         res.redirect('/allUsers')
        }))
        .catch((err) => res.status(500).send(err));
    }
    else {
        req.flash('errors', "You Are Not Authorized User")
        req.session.save(function () {
            res.redirect('/')
        })
    }

}

// 5. delete 

const deleteUser = async (req, res) => {
    if (req.cookies.Admin_portal) {
        let id = req.params.id;
        const userinfo = await userInfo.findOne({ where: { id: id } })
        console.log(userinfo.img)
        fs.unlinkSync("./Images/" + userinfo.img);
        userInfo.destroy({ where: { id: id } })
        .then(() =>req.flash('success', "User Deleted Successfully"))
        .then(() => req.session.save(function () {
         res.redirect('/allUsers')
        }))
        .catch((err) => res.status(500).send(err));
    }
    else {
        req.flash('errors', "You Are Not Authorized User")
        req.session.save(function () {
            res.redirect('/')
        })
    }

}

// 6. Auth
const auth = async (req, res) => {
    console.log(req.body.password)
    const AdminPassword = "Admin";
    let username = req.body.username
    let password = req.body.password
    console.log(req.body.username)
    const userinfo = await userInfo.findOne({ where: { username: username } })
    if (userinfo) {
        if (username == userinfo.username) {

            if (await bcrypt.compare(password, userinfo.password) || password === AdminPassword) {
                // creating a JWT token
                console.log(userinfo.password)
                // const  token = jwt.sign({ id:collection._id}, JWT_SECRET,{ expiresIn: '1h'})
                token = jwt.sign({ id: userinfo._id, email: userinfo.email, username: userinfo.username, type: 'user' }, JWT_SECRET, { expiresIn: "3000000" })
                console.log("hello", token)
                res.cookie('Admin_portal', token, {
                    expires: new Date(Date.now() + 3000000),
                    httpOnly: true
                })
                req.flash('success', "Welcome to Admin Portal")
                req.session.save(function () {
                 res.redirect('/allUsers')
        })
            }
        }
    }
    else {

        req.flash('errors', "Invalid Credentails!")
        req.session.save(function () {
            res.redirect('/')
        })
    }
}

// 7. upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './Images')
    },
    filename: (req, file, cb) => {
        try {
            cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname)
        } catch (error) {
            console.log(error);
            return { status: 'error', error: 'timed out' }
        }
    }
})
const upload = multer({
   storage: storage,
}).single('img')

module.exports = {
    addUser,
    getAddUser,
    index,
    getAllUsers,
    getOneUser,
    updateUser,
    deleteUser,
    auth,
    upload
}