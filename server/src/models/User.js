const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Not required for accounts created via Google Sign-In — they never set one.
    password: {
      type: String,
      required: function () { return !this.googleId; },
      minlength: 6,
      select: false,
    },
    googleId: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    addresses: [
      {
        label: String,
        line1: String,
        line2: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
        isDefault: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
