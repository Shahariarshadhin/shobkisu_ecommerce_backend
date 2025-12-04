const User = require('../models/User');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    console.log('📋 Fetching all users');
    
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    console.log(`✅ Found ${users.length} users`);
    res.json({ users, count: users.length });
    
  } catch (err) {
    console.error('❌ Error fetching users:', err);
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    console.log('🔍 Fetching user by ID:', req.params.id);
    
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('✅ User found:', user.email);
    res.json({ user });
    
  } catch (err) {
    console.error('❌ Error fetching user:', err);
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    console.log('📝 Updating user:', req.params.id);
    
    const { name, email, role } = req.body;
    
    // Validation
    if (!name || !email || !role) {
      return res.status(400).json({ message: 'Name, email, and role are required' });
    }
    
    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
    if (existingUser) {
      console.log('❌ Email already taken');
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    // Find and update user
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('✅ User updated successfully:', user.email);
    res.json({ user, message: 'User updated successfully' });
    
  } catch (err) {
    console.error('❌ Error updating user:', err);
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    console.log('🗑️ Deleting user:', req.params.id);
    
    // Prevent deleting yourself
    if (req.user.id === req.params.id) {
      console.log('❌ Cannot delete your own account');
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('✅ User deleted successfully:', user.email);
    res.json({ message: 'User deleted successfully' });
    
  } catch (err) {
    console.error('❌ Error deleting user:', err);
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
};

// Update user password
exports.updatePassword = async (req, res) => {
  try {
    console.log('🔒 Updating password for user:', req.params.id);
    
    const { password } = req.body;
    
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.password = password;
    await user.save();
    
    console.log('✅ Password updated successfully');
    res.json({ message: 'Password updated successfully' });
    
  } catch (err) {
    console.error('❌ Error updating password:', err);
    res.status(500).json({ message: 'Failed to update password', error: err.message });
  }
};