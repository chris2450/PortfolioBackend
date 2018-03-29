const express = require('express');
const router = express.Router();

const Contact = require('../models/contacts');

//retrieving contacts
router.get('/contacts', (req, res, next)=>{
	Contact.find(function(err, contacts){
		res.json(contacts);
	})
});

//add contacts
router.post('/contact', (req, res, next)=>{
	let newContact = new Contact({
        Name: 'Christian Barahona',
        Age : '16',
        dob : '07/24/2001',
        email : 'christianbarahona@gmail.com',
    })
})
    ;