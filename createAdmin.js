require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://resilinked_db_admin:dDJwBzfpJvaBUQqt@resilinked.bddvynh.mongodb.net/ResiLinked?retryWrites=true&w=majority";

async function createAdminAccount() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ userType: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin account already exists:', existingAdmin.email);
      console.log('📧 Admin Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.firstName, existingAdmin.lastName);
      process.exit(0);
    }

    // Hash password for admin
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@resilinked.com',
      password: hashedPassword,
      mobileNo: '09123456789',
      address: 'Admin Office',
      barangay: 'Administrative',
      idType: 'National ID',
      idNumber: 'ADMIN123456789',
      skills: [],
      userType: 'admin',
      isVerified: true,
      gender: 'male'
    });

    await adminUser.save();

    console.log('🎉 Admin account created successfully!');
    console.log('📧 Email: admin@resilinked.com');
    console.log('🔑 Password: admin123');
    console.log('👑 Role: Admin');
    console.log('✅ Status: Verified');
    
    console.log('\n🔐 Admin Login Credentials:');
    console.log('Email: admin@resilinked.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('❌ Error creating admin account:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createAdminAccount();
