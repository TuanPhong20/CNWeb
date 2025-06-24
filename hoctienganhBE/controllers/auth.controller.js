const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Đăng ký tài khoản mới
const register = async (req, res) => {
    try {
        const { email, password, displayName } = req.body;

        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo user mới
        const userData = {
            email,
            passwordHash: hashedPassword,
            displayName
        };

        const userId = await User.create(userData);
        
        // Tạo JWT token
        const token = jwt.sign(
            { userId, email, displayName },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            userId: userId
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
};

// Đăng nhập
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Tìm user theo email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Kiểm tra mật khẩu
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Tạo JWT token
        const token = jwt.sign(
            { 
                userId: user.UserID,
                email: user.Email,
                displayName: user.DisplayName
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Trả về thông tin user (không bao gồm password) và token
        const userResponse = {
            userId: user.UserID,
            email: user.Email,
            displayName: user.DisplayName
        };

        res.json({
            message: 'Login successful',
            token,
            user: userResponse
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error during login' });
    }
};

// Lấy thông tin user hiện tại
const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy user' });
        }

        const { passwordHash, ...userInfo } = user;
        res.json(userInfo);
    } catch (error) {
        console.error('Lỗi lấy thông tin user:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Cập nhật thông tin cá nhân (displayName)
const updateProfile = async (req, res) => {
    try {
        const { displayName } = req.body;
        if (!displayName) {
            return res.status(400).json({ message: 'Display name is required' });
        }
        const updated = await User.updateDisplayName(req.user.userId, displayName);
        if (!updated) {
            return res.status(404).json({ message: 'Không tìm thấy user' });
        }
        res.json({ message: 'Cập nhật thông tin thành công', displayName });
    } catch (error) {
        console.error('Lỗi cập nhật thông tin:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Đổi mật khẩu
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Thiếu thông tin mật khẩu' });
        }
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy user' });
        }
        // Log để debug
        console.log('user:', user);
        console.log('user.PasswordHash:', user.PasswordHash);
        console.log('user.passwordHash:', user.passwordHash);
        const passwordHash = user.PasswordHash || user.passwordHash;
        if (!passwordHash) {
            return res.status(500).json({ message: 'Không tìm thấy mật khẩu của user trong database' });
        }
        const isMatch = await bcrypt.compare(oldPassword, passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Mật khẩu cũ không đúng' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updated = await User.updatePassword(req.user.userId, hashedPassword);
        if (!updated) {
            return res.status(500).json({ message: 'Không thể cập nhật mật khẩu' });
        }
        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        console.error('Lỗi đổi mật khẩu:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

module.exports = {
    register,
    login,
    getCurrentUser,
    updateProfile,
    changePassword
}; 