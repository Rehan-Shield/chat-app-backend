const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, "Name is required"],
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email is Required"],
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid email address",
      },
    },
    photo: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Password Confirm is required"],
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: "Passwords do not match",
      },
    },
  },
  {
    timestamps: true,
  },
);

// Validation has already ran on the document before any of the pre save
// middlewares.
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

UserSchema.methods.comparePassword = async function (
  candidatePassword,
  acutalPassword,
) {
  return await bcrypt.compare(candidatePassword, acutalPassword);
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
