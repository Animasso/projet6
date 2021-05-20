const bcrypt =require('bcrypt');
const User = require('../models/user')
const jwt = require('jsonwebtoken');
const CryptoJS = require("crypto-js");

exports.signup = (req, res, next) => {
const emailCrypt = CryptoJS.AES.encrypt(req.body.email, 'secret key 123').toString();

    bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: emailCrypt,
        password: hash
      });
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));  

};

exports.login = (req, res, next) => {
  const emailCrypt = CryptoJS.AES.encrypt(req.body.email, 'secret key 123').toString();

    User.findOne({ email: emailCrypt })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
                { userId: user._id },
                'RANDOM_TOKEN_SECRET',
                { expiresIn: '24h' }
              ) 
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
}; 