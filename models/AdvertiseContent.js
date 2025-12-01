const mongoose = require("mongoose");

// Individual Section Schema with active status
const ContentSectionSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    content: { type: String, default: "" },
    isActive: { type: Boolean, default: true }
  },
  { _id: false }
);

// Discount Schema with active status
const DiscountSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  },
  { _id: false }
);

const AdvertiseContentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { 
      type: String, 
      required: true, 
      unique: true,  // This already creates an index
      lowercase: true,
      trim: true
    },
    offerEndTime: { type: Date, required: true },
    thumbImage: { type: String, required: true },
    regularImages: [{ type: String }],
    videos: [{ type: String }],
    discountShows: [DiscountSchema],
    
    // Each section as a separate field
    section1: ContentSectionSchema,
    section2: ContentSectionSchema,
    section3: ContentSectionSchema,
    section4: ContentSectionSchema,
    section5: ContentSectionSchema,
  },
  { timestamps: true }
);

// Auto-generate slug from title if not provided
AdvertiseContentSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  }
  next();
});

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
// Note: slug index is automatically created by unique: true above
AdvertiseContentSchema.index({ offerEndTime: 1 }); // For sorting by end time and filtering
AdvertiseContentSchema.index({ createdAt: -1 }); // For sorting by creation date
AdvertiseContentSchema.index({ title: "text" }); // For text search
AdvertiseContentSchema.index({ offerEndTime: 1, createdAt: -1 }); // Compound index for common queries

module.exports =
  mongoose.models.AdvertiseContent ||
  mongoose.model("AdvertiseContent", AdvertiseContentSchema);