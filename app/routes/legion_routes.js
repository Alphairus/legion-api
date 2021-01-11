// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for venues
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
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /venues
router.get('/venues', requireToken, (req, res, next) => {
  Legion.find()
    .then(venues => {
      // `venues` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return venues.map(venue => venue.toObject())
    })
    // respond with status 200 and JSON of the venues
    .then(venues => res.status(200).json({ venues: venues }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /venues/:id
router.get('/venues/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Legion.find({ _id: req.params.id, owner: req.user._id })
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "venue" JSON
    .then(venue => res.status(200).json({ venue: venue }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /venues
router.post('/venues', requireToken, (req, res, next) => {
  // set owner of new venue to be current user
  req.body.venue.owner = req.user.id

  Legion.create(req.body.venue)
    // respond to succesful `create` with status 201 and JSON of new "venue"
    .then(venue => {
      res.status(201).json({ venue: venue.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// UPDATE
// PATCH /venues/:id
router.patch('/venues/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.venue.owner

  Legion.findById(req.params.id)
    .then(handle404)
    .then(venue => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, venue)

      // pass the result of Mongoose's `.update` to the next `.then`
      return venue.updateOne(req.body.venue)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /venues/:id
router.delete('/venues/:id', requireToken, (req, res, next) => {
  Legion.findById(req.params.id)
    .then(handle404)
    .then(venue => {
      // throw an error if current user doesn't own `venue`
      requireOwnership(req, venue)
      // delete the venue ONLY IF the above didn't throw
      venue.deleteOne()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
