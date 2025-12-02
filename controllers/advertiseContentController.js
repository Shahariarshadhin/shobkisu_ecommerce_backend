const AdvertiseContent = require("../models/AdvertiseContent");

const useDb = !!process.env.MONGODB_URI;
const advertiseContentsMemory = [];

// Helper function to generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Helper function to calculate time remaining
const calculateTimeRemaining = (offerEndTime) => {
  const now = new Date();
  const endTime = new Date(offerEndTime);
  const diff = endTime - now;

  if (diff <= 0) {
    return {
      expired: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMilliseconds: 0,
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
};

// Get active offers only (not expired)
exports.getActiveOffers = async (req, res) => {
  try {
    if (useDb) {
      const contents = await AdvertiseContent.find({
        offerEndTime: { $gt: new Date() },
      }).sort({ offerEndTime: 1 });
      return res.status(200).json({
        message: "Active offers retrieved successfully",
        count: contents.length,
        data: contents,
      });
    } else {
      const activeContents = advertiseContentsMemory
        .map((content) => ({
          ...content,
          timeRemaining: calculateTimeRemaining(content.offerEndTime),
        }))
        .filter((content) => !content.timeRemaining.expired)
        .sort((a, b) => new Date(a.offerEndTime) - new Date(b.offerEndTime));

      return res.status(200).json({
        message: "Active offers retrieved successfully",
        count: activeContents.length,
        data: activeContents,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching active offers",
      error: error.message,
    });
  }
};

// Get content by slug
exports.getAdvertiseContentBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (useDb) {
      const content = await AdvertiseContent.findOne({ slug });
      if (!content) {
        return res.status(404).json({ message: "Advertise content not found" });
      }
      return res.status(200).json({
        message: "Advertise content retrieved successfully",
        data: content,
      });
    } else {
      const content = advertiseContentsMemory.find((c) => c.slug === slug);
      if (!content) {
        return res.status(404).json({ message: "Advertise content not found" });
      }
      const contentWithTime = {
        ...content,
        timeRemaining: calculateTimeRemaining(content.offerEndTime),
      };
      return res.status(200).json({
        message: "Advertise content retrieved successfully",
        data: contentWithTime,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching advertise content",
      error: error.message,
    });
  }
};

// Search advertise contents by title
exports.searchAdvertiseContents = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    if (useDb) {
      const contents = await AdvertiseContent.find({
        $text: { $search: q },
      }).sort({ score: { $meta: "textScore" } });
      return res.status(200).json({
        message: "Search results retrieved successfully",
        count: contents.length,
        data: contents,
      });
    } else {
      const searchResults = advertiseContentsMemory
        .filter((content) =>
          content.title.toLowerCase().includes(q.toLowerCase())
        )
        .map((content) => ({
          ...content,
          timeRemaining: calculateTimeRemaining(content.offerEndTime),
        }));

      return res.status(200).json({
        message: "Search results retrieved successfully",
        count: searchResults.length,
        data: searchResults,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error searching advertise contents",
      error: error.message,
    });
  }
};

// Create new advertise content
exports.createAdvertiseContent = async (req, res) => {
  try {
    const {
      title,
      slug,
      offerEndTime,
      thumbImage,
      price,
      originalPrice,
      regularImages,
      videos,
      discountShows,
      section1,
      section2,
      section3,
      section4,
      section5,
    } = req.body;

    if (!title || !offerEndTime || !thumbImage) {
      return res.status(400).json({
        message: "Title, offer end time, and thumb image are required",
      });
    }

    if (!price || price <= 0) {
      return res.status(400).json({
        message: "Price is required and must be greater than 0",
      });
    }

    // Generate slug if not provided
    const contentSlug = slug || generateSlug(title);

    if (useDb) {
      // Check if slug already exists
      const existingContent = await AdvertiseContent.findOne({ slug: contentSlug });
      if (existingContent) {
        return res.status(400).json({
          message: "A content with this slug already exists. Please use a different title or slug.",
        });
      }

      const content = await AdvertiseContent.create({
        title,
        slug: contentSlug,
        offerEndTime,
        thumbImage,
        price: parseFloat(price),
        originalPrice: parseFloat(originalPrice) || 0,
        regularImages: regularImages || [],
        videos: videos || [],
        discountShows: discountShows || [],
        section1: section1 || { title: '', content: '', isActive: true },
        section2: section2 || { title: '', content: '', isActive: true },
        section3: section3 || { title: '', content: '', isActive: true },
        section4: section4 || { title: '', content: '', isActive: true },
        section5: section5 || { title: '', content: '', isActive: true },
      });
      return res.status(201).json({
        message: "Advertise content created successfully",
        data: content,
      });
    } else {
      // Check if slug already exists in memory
      const existingContent = advertiseContentsMemory.find((c) => c.slug === contentSlug);
      if (existingContent) {
        return res.status(400).json({
          message: "A content with this slug already exists. Please use a different title or slug.",
        });
      }

      const id = String(advertiseContentsMemory.length + 1);
      const newContent = {
        id,
        title,
        slug: contentSlug,
        offerEndTime,
        thumbImage,
        price: parseFloat(price),
        originalPrice: parseFloat(originalPrice) || 0,
        regularImages: regularImages || [],
        videos: videos || [],
        discountShows: discountShows || [],
        section1: section1 || { title: '', content: '', isActive: true },
        section2: section2 || { title: '', content: '', isActive: true },
        section3: section3 || { title: '', content: '', isActive: true },
        section4: section4 || { title: '', content: '', isActive: true },
        section5: section5 || { title: '', content: '', isActive: true },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      newContent.timeRemaining = calculateTimeRemaining(offerEndTime);
      advertiseContentsMemory.push(newContent);
      return res.status(201).json({
        message: "Advertise content created successfully",
        data: newContent,
      });
    }
  } catch (error) {
    console.error('Create content error:', error);
    return res.status(500).json({
      message: "Error creating advertise content",
      error: error.message,
    });
  }
};

// Get all advertise contents
exports.getAllAdvertiseContents = async (req, res) => {
  try {
    const { status, sort = "newest" } = req.query;

    if (useDb) {
      let query = {};

      if (status === "active") {
        query.offerEndTime = { $gt: new Date() };
      } else if (status === "expired") {
        query.offerEndTime = { $lte: new Date() };
      }

      let sortOption = {};
      if (sort === "newest") {
        sortOption = { createdAt: -1 };
      } else if (sort === "ending-soon") {
        sortOption = { offerEndTime: 1 };
      } else if (sort === "oldest") {
        sortOption = { createdAt: 1 };
      }

      const contents = await AdvertiseContent.find(query).sort(sortOption);
      return res.status(200).json({
        message: "Advertise contents retrieved successfully",
        count: contents.length,
        data: contents,
      });
    } else {
      let contentsWithTime = advertiseContentsMemory.map((content) => ({
        ...content,
        timeRemaining: calculateTimeRemaining(content.offerEndTime),
      }));

      if (status === "active") {
        contentsWithTime = contentsWithTime.filter((c) => !c.timeRemaining.expired);
      } else if (status === "expired") {
        contentsWithTime = contentsWithTime.filter((c) => c.timeRemaining.expired);
      }

      if (sort === "ending-soon") {
        contentsWithTime.sort(
          (a, b) => new Date(a.offerEndTime) - new Date(b.offerEndTime)
        );
      } else if (sort === "oldest") {
        contentsWithTime.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      }

      return res.status(200).json({
        message: "Advertise contents retrieved successfully",
        count: contentsWithTime.length,
        data: contentsWithTime,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching advertise contents",
      error: error.message,
    });
  }
};

// Get single advertise content by ID
exports.getAdvertiseContentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (useDb) {
      const content = await AdvertiseContent.findById(id);
      if (!content) {
        return res.status(404).json({ message: "Advertise content not found" });
      }
      return res.status(200).json({
        message: "Advertise content retrieved successfully",
        data: content,
      });
    } else {
      const content = advertiseContentsMemory.find((c) => c.id === id);
      if (!content) {
        return res.status(404).json({ message: "Advertise content not found" });
      }
      const contentWithTime = {
        ...content,
        timeRemaining: calculateTimeRemaining(content.offerEndTime),
      };
      return res.status(200).json({
        message: "Advertise content retrieved successfully",
        data: contentWithTime,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching advertise content",
      error: error.message,
    });
  }
};

// Update advertise content
exports.updateAdvertiseContent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If title is being updated and no slug provided, regenerate slug
    if (updateData.title && !updateData.slug) {
      updateData.slug = generateSlug(updateData.title);
    }

    if (useDb) {
      // Check if new slug conflicts with existing content
      if (updateData.slug) {
        const existingContent = await AdvertiseContent.findOne({
          slug: updateData.slug,
          _id: { $ne: id },
        });
        if (existingContent) {
          return res.status(400).json({
            message: "A content with this slug already exists",
          });
        }
      }

      const content = await AdvertiseContent.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      if (!content) {
        return res.status(404).json({ message: "Advertise content not found" });
      }
      return res.status(200).json({
        message: "Advertise content updated successfully",
        data: content,
      });
    } else {
      const index = advertiseContentsMemory.findIndex((c) => c.id === id);
      if (index === -1) {
        return res.status(404).json({ message: "Advertise content not found" });
      }

      // Check if new slug conflicts
      if (updateData.slug) {
        const existingContent = advertiseContentsMemory.find(
          (c) => c.slug === updateData.slug && c.id !== id
        );
        if (existingContent) {
          return res.status(400).json({
            message: "A content with this slug already exists",
          });
        }
      }

      advertiseContentsMemory[index] = {
        ...advertiseContentsMemory[index],
        ...updateData,
        updatedAt: new Date(),
      };
      return res.status(200).json({
        message: "Advertise content updated successfully",
        data: advertiseContentsMemory[index],
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error updating advertise content",
      error: error.message,
    });
  }
};

// Delete advertise content
exports.deleteAdvertiseContent = async (req, res) => {
  try {
    const { id } = req.params;

    if (useDb) {
      const content = await AdvertiseContent.findByIdAndDelete(id);
      if (!content) {
        return res.status(404).json({ message: "Advertise content not found" });
      }
      return res.status(200).json({
        message: "Advertise content deleted successfully",
      });
    } else {
      const index = advertiseContentsMemory.findIndex((c) => c.id === id);
      if (index === -1) {
        return res.status(404).json({ message: "Advertise content not found" });
      }
      advertiseContentsMemory.splice(index, 1);
      return res.status(200).json({
        message: "Advertise content deleted successfully",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting advertise content",
      error: error.message,
    });
  }
};