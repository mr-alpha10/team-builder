const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const { validateProfileUpdate } = require('../middleware/validation');

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -refreshToken');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile
router.put('/me', auth, validateProfileUpdate, async (req, res) => {
  try {
    const { name, bio, college, year, skills, experienceLevel, interests, github, linkedin, availability } = req.body;
    
    const skillsArr = typeof skills === 'string'
      ? skills.split(',').map(s => s.trim()).filter(Boolean)
      : (skills || undefined);

    const interestsArr = typeof interests === 'string'
      ? interests.split(',').map(s => s.trim()).filter(Boolean)
      : (interests || undefined);

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (college !== undefined) updateData.college = college;
    if (year !== undefined) updateData.year = parseInt(year);
    if (skillsArr !== undefined) updateData.skills = skillsArr;
    if (experienceLevel !== undefined) updateData.experienceLevel = experienceLevel;
    if (interestsArr !== undefined) updateData.interests = interestsArr;
    if (github !== undefined) updateData.github = github;
    if (linkedin !== undefined) updateData.linkedin = linkedin;
    if (availability !== undefined) updateData.availability = availability;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    Object.assign(user, updateData);
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshToken;

    res.json(userObj);
  } catch (err) {
    console.error('Update profile error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: Object.values(err.errors).map(e => ({ field: e.path, message: e.message }))
      });
    }
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Browse all available users
router.get('/', auth, async (req, res) => {
  try {
    const { skill, search, availability, page = 1, limit = 30 } = req.query;
    let filter = { _id: { $ne: req.userId } };

    if (skill) filter.skills = { $in: [new RegExp(skill, 'i')] };
    if (search) filter.name = new RegExp(search, 'i');
    if (availability) filter.availability = availability;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -refreshToken')
        .limit(parseInt(limit))
        .skip(skip)
        .sort({ createdAt: -1 }),
      User.countDocuments(filter)
    ]);

    res.json({ 
      users, 
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Browse users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Delete account
router.delete('/me', auth, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // For Google users (they have googleId and random password)
    if (user.googleId) {
      // Delete user's projects and remove from team memberships
      const Project = require('../models/Project');
      await Project.deleteMany({ creator: req.userId });
      await Project.updateMany(
        { 'members.user': req.userId },
        { $pull: { members: { user: req.userId } } }
      );
      
      await User.findByIdAndDelete(req.userId);
      return res.json({ message: 'Account deleted successfully' });
    }
    
    // Verify password for regular users
    if (!password) return res.status(400).json({ error: 'Password is required' });
    
    const bcrypt = require('bcryptjs');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid password' });
    
    // Delete user's projects and remove from team memberships
    const Project = require('../models/Project');
    await Project.deleteMany({ creator: req.userId });
    await Project.updateMany(
      { 'members.user': req.userId },
      { $pull: { members: { user: req.userId } } }
    );
    
    await User.findByIdAndDelete(req.userId);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;
