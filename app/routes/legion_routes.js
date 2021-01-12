// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

const router = express.Router()

// pull in Mongoose model for legion
const Legion= require('../models/legion')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { legion: { title: '', text: 'foo' } } -> { legion: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
// const router = express.Router()

// INDEX
// GET /legions
router.get('/legions', requireToken, (req, res, next) => {
  Legion.find({ owner: req.user._id })
    .then(legions => {
       // `legions` will be an array of Mongoose documents
       // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return legions.map(legion => legion.toObject())
    })
    // respond with status 200 and JSON of the legion
    .then(legion => res.status(200).json({ legions: legion }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /legions/:id
router.get('/legions/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Legion.findOne({ _id: req.params.id, owner: req.user._id })
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "legion" JSON
    .then(legion => res.status(200).json({ legion: legion }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /legions
router.post('/legions', requireToken, (req, res, next) => {
  // set owner of new legion to be current user
  req.body.legion.owner = req.user._id

  Legion.create(req.body.legion)
    // respond to succesful `create` with status 201 and JSON of new "legion"
    .then(legion => {
      res.status(201).json({ legion: legion.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// UPDATE
// PATCH /legions/:id
router.patch('/legions/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.legion.owner

  Legion.findOne({ _id: req.params.id, owner: req.user._id})
    .then(handle404)
    .then(legion => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, legion)

      // pass the result of Mongoose's `.update` to the next `.then`
      return legion.updateOne(req.body.legion)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /legions/:id
router.delete('/legions/:id', requireToken, (req, res, next) => {
  Legion.findOne({ _id: req.params.id, owner: req.user._id})
    .then(handle404)
    .then(legion => {
      // throw an error if current user doesn't own `legion`
      requireOwnership(req, legion)
      // delete the legion ONLY IF the above didn't throw
      legion.deleteOne()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
