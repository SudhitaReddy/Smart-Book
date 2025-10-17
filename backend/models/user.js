const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// ✅ Address Sub-Schema
const addressSchema = new mongoose.Schema({
  type: { type: String, enum: ["home", "work", "other"], default: "home" },
  street: { type: String, required: [true, "Street address is required"] },
  city: { type: String, required: [true, "City is required"] },
  state: { type: String, required: [true, "State is required"] },
  zipCode: { type: String, required: [true, "ZIP Code is required"] },
  country: { type: String, default: "India" },
  phone: {
    type: String,
    match: [/^(\+91)?0?[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"],
    required: false
  },
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
    },

    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      match: [/^(\+91)?0?[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"]
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false   // ✅ Hide password by default
    },

    // ✅ Support roles for user, seller, admin
    role: { type: String, enum: ["user", "seller", "admin"], default: "user" },

    isActive: { type: Boolean, default: true },

    // ✅ Addresses
    addresses: [addressSchema],

    // ✅ Forgot Password fields
    resetToken: String,
    resetTokenExpire: Date
  },
  { timestamps: true }
);

// ✅ Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ✅ Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ✅ Exclude password when sending JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// ✅ Generate Reset Password Token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token & set to resetToken field
  this.resetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  // Set expire time (15 min)
  this.resetTokenExpire = Date.now() + 15 * 60 * 1000;

  return resetToken; // return raw token to send in email
};

module.exports = mongoose.model("User", userSchema);
