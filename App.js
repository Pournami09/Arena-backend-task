//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true, useUnifiedTopology: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/codechefuserDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  // we're connected!
});

// const validateEmail = function (email) {
//   var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
//   return re.test(email);
// };

// const validatePhoneNumber = function (phone) {
//   var re = /((\+*)((0[ -]+)*|(91 )*)(\d{12}+|\d{10}+))|\d{5}([- ]*)\d{6}/;
//   return re.test(phone);
// };

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    unique: true,
    required: true,
  },
  contact: {
    $or: [{
      email: {
        type: String,
        unique: true,
        lowercase: true,
        // validate: [validateEmail, "Please enter your GST email address"],
        // match: [
        //   /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        //   "Please enter a valid email address",
        // ],
      },
      phone: {
        type: Number,
        unique: true,
        // validate: [validatePhoneNumber, "Please enter your phone number"],
        // match: [
        //   /((\+*)((0[ -]+)*|(91 )*)(\d{12}+|\d{10}+))|\d{5}([- ]*)\d{6}/,
        //   "Please enter a valid phone number",
        // ],
      },
    },
    ],
 
  },

});

const User = mongoose.model("User", userSchema);

// db.runCommand({
//   collMod: "users",
//   validator: {
//     $and: [
//       { yearOfBirth: { $lte: 1994 } },
//       {
//         $or: [
//           { "contact.phone": { $type: "string" } },
//           { email: { $type: "string" } },
//         ],
//       },
//     ],
//   },
// });

app.route("/users")
  .get(function (req, res) {
    User.find(function (err, foundUsers) {
      if (!err) {
        res.send(foundUsers);
      } else {
        res.send(err);
      }
    });
  })
  .post(function (req, res) {
    const newUser = new User({
      username: req.body.username,
      password: req.body.password,
      contact: {
          $or: [
            { phone: req.body.phone },
            { email: req.body.email },
          ],
        },
    });
    newUser.save(function (err) {
      if (!err) {
        res.send("Successfully added a new user.");
      } else {
        res.send(err);
      }
    });
  })
  .delete(function (req, res) {
    User.deleteMany(function (err) {
      if (!err) {
        res.send("Successfully deleted all the users.");
      } else {
        res.send(err);
      }
    });
  });

app.route("/users/:username")
  .get(function(req,res){
    const usernameId = req.params.username;

    User.findOne({username:usernameId}, function(err, foundUser){
        if(foundArticle){
            res.send(foundUser);
        }else{
            res.send("No such user was found");
        }
    });
})

.patch(function(req, res){
  const usernameId = req.params.username;

    User.findOneAndUpdate(
        {username: usernameId},
        {$set: req.body},
        function(err){
            if(!err){
                res.send("Successfully updated the user.")
            }
            else{
                res.send(err);
            }
        }
    );
})

.delete(function(req,res){
  const usernameId = req.params.username;

    User.findOneAndDelete(
        {username: usernameId},
        function(err){
            if(!err){
                res.send("Successfully deleted the user.");
            }else{
                res.send(err);
            }
        }
    );

});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
