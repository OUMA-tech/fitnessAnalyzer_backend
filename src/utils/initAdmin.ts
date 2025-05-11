import User from '../models/userModel';
import bcrypt from 'bcrypt';

export const createRootAdmin = async () => {
  const existing = await User.findOne({ email: 'admin@example.com' });
  if (!existing) {
    const hashedDefaultPassword = await bcrypt.hash('admin123', 10); // 推荐放到 .env 里

    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedDefaultPassword,
      role: 'admin'
    });

    console.log('✅ Root admin created');
  } else {
    console.log('ℹ️ Admin already exists');
  }
};
