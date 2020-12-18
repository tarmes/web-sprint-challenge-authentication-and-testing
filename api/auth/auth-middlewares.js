const Users = require('../auth/auth-model');
const jwt = require('jsonwebtoken');

const checkPayload = (req, res, next) => {
   if ( !req.body.username || !req.body.password ) {
            res.status(401).json('username and password required'); 
   } else {
            next();
   }
};

const checkUsernameUnique = async (req, res, next) => {
   try {
            const rows = Users.findBy({ username: req.body.username });
            if (!rows.length) {
                     next();
            } else {
                     res.status(401).json("username taken");
            }
   } catch (error) {
            res.status(500).json("username taken")
   }
};

const checkUsernameExists = async (req, res, next) => {
   try {
            const rows = await Users.findBy({ username: req.body.username });
            if (rows.length) {
                     req.userData = rows[0];
                     next();         
            } else {
                     res.status(404).json("invalid credentials");
            }
   } catch (error) {
            res.status(500).json("invalid credentials");
   }
}

const makeToken = (user) => {
   const payload = {
      subject: user.id,
      username: user.username,
   }
   const options = {
      expiresIn: '200s',
   }
   return jwt.sign(payload, 'foo', options)
}

module.exports = {
checkPayload,
checkUsernameExists,
checkUsernameUnique,
makeToken
}