const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const BCRYPT_PREFIX = /^\$2[aby]\$\d{2}\$/;

function isBcryptHash(value) {
  return typeof value === "string" && BCRYPT_PREFIX.test(value) && value.length >= 60;
}

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  progress: { type: Object, default: {} },
}, { timestamps: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  if (isBcryptHash(this.password)) return;
  const rounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
  this.password = await bcrypt.hash(this.password, rounds);
});

userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    progress: this.progress || {},
  };
};

module.exports = mongoose.model("User", userSchema);
