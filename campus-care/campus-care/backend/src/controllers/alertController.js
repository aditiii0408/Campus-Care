const Alert = require("../models/Alert");

exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ isResolved: false })
      .sort({ createdAt: -1 })
      .populate("student", "name email rollNumber department year");
    res.json({ alerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("student", "name email rollNumber department year");
    res.json({ alerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resolveAlert = async (req, res) => {
  try {
    const { notes } = req.body;
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { isResolved: true, resolvedBy: req.user._id, resolvedAt: new Date(), notes: notes || "" },
      { new: true }
    );
    if (!alert) return res.status(404).json({ error: "Alert not found." });
    res.json({ alert });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUnresolvedCount = async (req, res) => {
  try {
    const count = await Alert.countDocuments({ isResolved: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};