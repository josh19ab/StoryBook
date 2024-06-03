const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const User = require("../models/User");

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "https://story-book-omega.vercel.app/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        // passport callback function
        try {
          // Check if user already exists in our database
          const existingUser = await User.findOne({ googleId: profile.id });

          if (existingUser) {
            // If user already exists, pass the existing user to done function
            done(null, existingUser);
          } else {
            // If user doesn't exist, create a new user
            const newUser = new User({
              googleId: profile.id,
              displayName: profile.displayName,
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
              image: profile.photos[0].value,
            });

            await newUser.save();
            done(null, newUser);
          }
        } catch (err) {
          console.error(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
