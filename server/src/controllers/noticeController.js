import { Notice } from '../models/Notice.js';

// @desc    Get notices visible to current user role
// @route   GET /api/notices
// @access  Private
export const getAllNotices = async (req, res) => {
  try {
    const userRole = req.user ? req.user.role : 'all';
    const roleFilter = userRole === 'admin' ? {} : { targetRole: { $in: ['all', userRole] } };

    const notices = await Notice.find(roleFilter)
      .populate('postedBy', 'name role')
      .sort({ isPinned: -1, createdAt: -1 });

    res.json({ success: true, count: notices.length, data: notices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new notice
// @route   POST /api/notices
// @access  Private (Admin & Faculty)
export const createNotice = async (req, res) => {
  try {
    const { title, content, targetRole, category, isPinned } = req.body;

    const notice = await Notice.create({
      title,
      content,
      targetRole: targetRole || 'all',
      category: category || 'General',
      isPinned: isPinned || false,
      postedBy: req.user._id,
    });

    const populated = await Notice.findById(notice._id).populate('postedBy', 'name role');

    res.status(201).json({
      success: true,
      message: 'Notice broadcasted successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete notice
// @route   DELETE /api/notices/:id
// @access  Private (Admin)
export const deleteNotice = async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
