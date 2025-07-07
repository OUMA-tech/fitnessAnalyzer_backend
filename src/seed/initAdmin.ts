import { UserMapper } from '../mappers/user/userMapper';
import bcrypt from 'bcrypt';

export const createRootAdmin = async (userMapper:UserMapper) => {
  const existing = await userMapper.findByEmail('admin@example.com');
  if (!existing) {
    const hashedDefaultPassword = await bcrypt.hash('admin123', 10); // 推荐放到 .env 里

    await userMapper.create({
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
