const mongoose = require("mongoose");
const slugify = require("slugify");

const ChatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    slug: {
      type: String,
    },
    isGroupChat: {
      type: Boolean,
      required: true,
      default: false,
    },
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
);

ChatSchema.pre("save", function (next) {
  if (!this.isModified("name")) {
    return next();
  }
  this.slug = slugify(this.name, { lower: true, trim: true });
  next();
});

ChatSchema.virtual("messages", {
  localField: "_id",
  foreignField: "chat",
  ref: "Message",
});

const Chat = mongoose.model("Chat", ChatSchema);

module.exports = Chat;
