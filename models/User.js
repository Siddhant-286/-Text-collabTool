const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// For encrypting the password field before saving it into the DB
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
  const salt = await bcrypt.genSalt(saltRounds);
  this.password = await bcrypt.hash(this.password, salt);
  console.log('Hashed Password during Registration:', this.password);  // Debug log for the hashed password
  next();  // Ensure that next() is called after hashing
});

module.exports = mongoose.model('User', userSchema);
