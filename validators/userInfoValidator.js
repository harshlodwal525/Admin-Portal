const Joi = require('joi')
const db = require('../models')
const User = db.users

function validateUser(checkUser) {
    console.log(checkUser)
    const JoiSchema = Joi.object({
        name: Joi.string()
            .min(3)
            .max(30)
            .required(),

        email: Joi.string()
            .email()
            .min(5)
            .max(50)
            .required(),

        contact: Joi.number()
            .min(10)
            //.max(11)
            .required(),

        username: Joi.string()
            .required()
            .min(3),

        // password: Joi.string()
        //     .min(3)
        //     .required()
        //     .strict()
    })

    return JoiSchema.validate(checkUser)
}

// next  
const checkUser = (req, res, next) => {

    let info = {
        name: req.body.name,
        email: req.body.email,
        contact: req.body.contact,
        username: req.body.username,
       // password: req.body.password,
        //img: new_img,

    }
    console.log(info)
    const response = validateUser(info)
    if (response.error) {
        res.send(response.error.message)
    }
    else {
        next()
        // res.send("Validated Data")
    }
}

module.exports = {
    checkUser
}