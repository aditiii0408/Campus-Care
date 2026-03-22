const ForumPost = require("../models/ForumPost");

exports.getPosts = async (req, res) => {
  try {
    const { tag, page = 1, limit = 20 } = req.query;
    const filter = { isRemoved: false };
    if (tag && tag !== "All") filter.tag = tag;

    const posts = await ForumPost.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("-author"); // always anonymous in listing

    const total = await ForumPost.countDocuments(filter);
    res.json({ posts, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { title, body, tag, isAnonymous } = req.body;
    const post = await ForumPost.create({
      author: req.user._id,
      title,
      body,
      tag: tag || "General",
      isAnonymous: isAnonymous !== false,
    });
    res.status(201).json({ post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post || post.isRemoved) return res.status(404).json({ error: "Post not found." });

    const idx = post.likes.indexOf(req.user._id);
    if (idx === -1) post.likes.push(req.user._id);
    else post.likes.splice(idx, 1);

    await post.save();
    res.json({ likes: post.likes.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addReply = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await ForumPost.findById(req.params.id);
    if (!post || post.isRemoved) return res.status(404).json({ error: "Post not found." });

    post.replies.push({ author: req.user._id, content, isAnonymous: true });
    await post.save();
    res.status(201).json({ replies: post.replies.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
