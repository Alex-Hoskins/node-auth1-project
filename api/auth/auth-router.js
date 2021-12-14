// Require `checkUsernameFree`, `checkUsernameExists` and `checkPasswordLength`
// middleware functions from `auth-middleware.js`. You will need them here!
const express = require('express')
const bcrypt = require('bcryptjs')
const router = express.Router()
const User = require('../users/users-model')
const 
{
  restricted,
  checkUsernameFree,
  checkUsernameExists,
  checkPasswordLength
}= require('./auth-middleware')

/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "user_id": 2,
    "username": "sue"
  }

  response on username taken:
  status 422
  {
    "message": "Username taken"
  }

  response on password three chars or less:
  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
 */

  router.post('/register', checkPasswordLength, checkUsernameFree, async (req, res, next) => {
    try {
      const { username, password } = req.body
      const newUser = {
        username,
        password: bcrypt.hashSync(password, 8), // 2^8 rounds
      }
      const [created] = await User.add(newUser)
      res.status(200).json(created)
    } catch (err) {
      next(err)
    }
  })

/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "message": "Welcome sue!"
  }

  response on invalid credentials:
  status 401
  {
    "message": "Invalid credentials"
  }
 */
  router.post('/login', checkUsernameExists, async (req, res, next) => {
    try {
      const { username, password } = req.body
      const userFromDb = await User.findBy(username)
      if (!userFromDb) {
        return next({ message: 'Invalid credentials', status: 401 })
      }
      const verifies = bcrypt.compareSync(password, userFromDb.password)
      if (!verifies) {
        return next({ message: 'Invalid credentials', status: 401 })
      }
      req.session.user = userFromDb
      res.status(200).json({
        message: `Welcome ${username}!`
      })
    } catch (err) {
      next(err)
    }
  })

/**
  3 [GET] /api/auth/logout

  response for logged-in users:
  status 200
  {
    "message": "logged out"
  }

  response for not-logged-in users:
  status 200
  {
    "message": "no session"
  }
 */
  router.get('/logout', async (req, res, next) => {
    try {
      if (req.session.user) {
        req.session.destroy((err) => {
          if (err) {
            res.json(err)
          } else {
            res.status(200).json({message:'logged out'})
          }
        })
      } else {
        res.status(200).json({message:'no session'})
      }
    } catch (err) {
      next(err)
    }
  })
 
// Don't forget to add the router to the `exports` object so it can be required in other modules
module.exports = router