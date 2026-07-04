import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({
      username: 'sudhanshugauravv',
    });

    if (existingAdmin) {
      console.log('Admin already exists.');
      process.exit(0);
    }

    await User.create({
      role: 'admin',
      username: 'sudhanshugauravv',
      name: 'Sudhanshu Admin',
      email: 'sudhanshu29gaurav@gmail.com',
      password: 'S@udhanshu29',
      phone: '9142047328',
      bloodGroup: 'O+',
      city: 'Patna',
      address: 'Patna, Bihar, India',
      age: 22,
      gender: 'Male',
      isAvailable: false,
      avatarColor: '#111827',
    });

    console.log('Default admin created successfully.');
    console.log('Username: sudhanshugauravv');
    console.log('Password: S@udhanshu29');

    process.exit(0);
  } catch (error) {
    console.error('Admin creation failed:', error.message);
    process.exit(1);
  }
};

createAdmin();