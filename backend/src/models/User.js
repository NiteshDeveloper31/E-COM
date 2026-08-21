import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    username: {
      type: String,
      default: undefined
    },
    role: {
      type: String,
      enum: ["superadmin", "admin", "customer"],
      default: "customer"
    },
    permissions: {
      type: [String],
      default: ["dashboard", "products", "inventory", "categories", "orders", "customers", "banners", "analytics", "settings", "profile"]
    },
    avatar: {
      type: String,
      default: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to ensure unique username for legacy MongoDB indexes
userSchema.pre("save", function (next) {
  if (!this.username) {
    this.username = `usr_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
  }
  next();
});

const User = mongoose.model("User", userSchema);

// Automatically drop legacy username_1 unique index on database if it exists
User.collection.dropIndex("username_1").catch(() => {});

export default User;
