const router = require('express').Router();
const bcrypt = require('bcryptjs');

const Users = require('./auth-model');
const { 
  checkPayload, 
  checkUsernameExists, 
  checkUsernameUnique,
  makeToken 
} = require('./auth-middlewares');

router.post('/register', checkPayload, checkUsernameUnique, async (req, res) => {

  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
  try {
      const hash = bcrypt.hashSync(req.body.password, 10);
      const newUser = await Users.add({ ...req.body, password: hash });
      res.status(201).json(newUser);
  } catch (error) {
      res.status(500).json("username taken")
  }
});

router.post('/login', checkPayload, checkUsernameExists, (req, res) => {

  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
  try {
      const verifies = bcrypt.compareSync(req.body.password, req.userData.password);
      if (verifies) {
        const token = makeToken(req.userData)
        res.status(200).json({ message: `Welcome to our API, ${req.userData.username}`, token });
      } else {
        res.status(400).json("invalid credentials")
      }
  } catch (error) {
      res.status(500).json("invalid credentials")
  }
});

module.exports = router;
