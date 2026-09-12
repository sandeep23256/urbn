const asyncHandler = require("express-async-handler");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route  POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("An account with this email already exists");
  }

  const user = await User.create({ name, email, password });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id, user.role),
  });
});

// @route  POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id, user.role),
  });
});

// @route  GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

// @route  POST /api/auth/google
// Verifies the ID token Google's Sign-In button hands the frontend, then
// finds or creates a matching user and issues our own JWT — same shape as
// the normal login response, so the frontend treats it identically.
const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    res.status(400);
    throw new Error("Missing Google credential");
  }
  if (!process.env.GOOGLE_CLIENT_ID) {
    res.status(500);
    throw new Error("Google sign-in isn't configured on the server (GOOGLE_CLIENT_ID missing)");
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    res.status(401);
    throw new Error("Invalid Google credential");
  }

  const { email, name, sub } = payload;

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ name, email, googleId: sub });
  } else if (!user.googleId) {
    // an existing email/password account signing in with Google for the
    // first time — link the accounts rather than creating a duplicate
    user.googleId = sub;
    await user.save();
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id, user.role),
  });
});

// @route  POST /api/auth/demo-google
// A stand-in for real Google Sign-In, for demos where a Google OAuth Client
// ID hasn't been set up yet. Logs into (or creates) one fixed demo account.
// IMPORTANT: replace with the real /google route once you have a Client ID —
// see README for setup steps. Don't ship this to a real production site.
const demoGoogleLogin = asyncHandler(async (req, res) => {
  const demoEmail = "demo.google@urbnlab.dev";

  let user = await User.findOne({ email: demoEmail });
  if (!user) {
    user = await User.create({
      name: "Demo Google User",
      email: demoEmail,
      googleId: "demo-google-account",
    });
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id, user.role),
  });
});

module.exports = { registerUser, loginUser, getMe, googleLogin, demoGoogleLogin };
