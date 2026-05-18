const express = require('express');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const User = require('../models/user');

const router = express.Router();


// REGISTER API

router.post('/register', async (req, res) => {

  try {

    const { username, email, password } = req.body;

    // CHECK USER

    const existingUser = await User.findOne({ email });

    if(existingUser){

      return res.status(400).json({
        message: 'User already exists'
      });

    }

    // HASH PASSWORD

    const hashedPassword = await bcrypt.hash(password, 10);

    // CREATE USER

    const user = new User({

      username,
      email,
      password: hashedPassword

    });

    await user.save();

    res.status(201).json({
      message: 'User registered successfully'
    });

  }

  catch(error){

    res.status(500).json({
      message: error.message
    });

  }

});


// LOGIN API

router.post('/login', async (req, res) => {

  try {

    const { email, password } = req.body;

    // CHECK USER

    const user = await User.findOne({ email });

    if(!user){

      return res.status(400).json({
        message: 'User not found'
      });

    }

    // CHECK PASSWORD

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if(!isMatch){

      return res.status(400).json({
        message: 'Invalid password'
      });

    }

    // JWT TOKEN

    const token = jwt.sign(

      {
        id: user._id
      },

      process.env.JWT_SECRET,

      {
        expiresIn: '7d'
      }

    );

    res.status(200).json({

      message: 'Login successful',

      token

    });

  }

  catch(error){

    res.status(500).json({
      message: error.message
    });

  }

});

module.exports = router;