const mongoose = require("mongoose");

const ContentSectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
  },
  { _id: false }
);

const AdvertiseContentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    offerEndTime: { type: Date, required: true },
    thumbImage: { type: String, required: true },
    regularImages: [{ type: String }],
    videos: [{ type: String }],
    discountShows: [{ type: String }],
    sections: {
      section1: ContentSectionSchema,
      section2: ContentSectionSchema,
      section3: ContentSectionSchema,
      section4: ContentSectionSchema,
      section5: ContentSectionSchema,
    },
  },
  { timestamps: true }
);

// Virtual field to calculate remaining time
AdvertiseContentSchema.virtual("timeRemaining").get(function () {
  const now = new Date();
  const endTime = new Date(this.offerEndTime);
  const diff = endTime - now;

  if (diff <= 0) {
    return {
      expired: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      message: "Offer expired",
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    expired: false,
    days,
    hours,
    minutes,
    seconds,
    totalMilliseconds: diff,
    message: `${days}d ${hours}h ${minutes}m ${seconds}s remaining`,
  };
});

// Ensure virtuals are included in JSON
AdvertiseContentSchema.set("toJSON", { virtuals: true });
AdvertiseContentSchema.set("toObject", { virtuals: true });

// Indexes for better query performance
AdvertiseContentSchema.index({ offerEndTime: 1 }); // For sorting by end time and filtering expired offers
AdvertiseContentSchema.index({ createdAt: -1 }); // For sorting by creation date (most recent first)
AdvertiseContentSchema.index({ title: "text" }); // For text search on titles
AdvertiseContentSchema.index({ offerEndTime: 1, createdAt: -1 }); // Compound index for common queries

module.exports =
  mongoose.models.AdvertiseContent ||
  mongoose.model("AdvertiseContent", AdvertiseContentSchema);
