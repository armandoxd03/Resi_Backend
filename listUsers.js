require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://resilinked_db_admin:dDJwBzfpJvaBUQqt@resilinked.bddvynh.mongodb.net/ResiLinked?retryWrites=true&w=majority";

async function listAllUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find({})
      .select('firstName lastName email userType isVerified createdAt')
      .sort({ userType: 1, firstName: 1 });

    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    console.log(`\n📋 Found ${users.length} users in database:\n`);
    
    // Group users by type
    const usersByType = {
      admin: [],
      employer: [],
      employee: [],
      both: []
    };

    users.forEach(user => {
      usersByType[user.userType].push(user);
    });

    // Display admin accounts
    if (usersByType.admin.length > 0) {
      console.log('👑 ADMIN ACCOUNTS:');
      console.log('='.repeat(50));
      usersByType.admin.forEach((user, index) => {
        console.log(`${index + 1}. 👤 ${user.firstName} ${user.lastName}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🔑 Password: admin123 (default)`);
        console.log(`   ✅ Verified: ${user.isVerified ? 'Yes' : 'No'}`);
        console.log(`   📅 Created: ${user.createdAt.toLocaleDateString()}`);
        console.log('');
      });
    }

    // Display employer accounts
    if (usersByType.employer.length > 0) {
      console.log('🏢 EMPLOYER ACCOUNTS:');
      console.log('='.repeat(50));
      usersByType.employer.forEach((user, index) => {
        console.log(`${index + 1}. 👤 ${user.firstName} ${user.lastName}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🔑 Password: password123 (test accounts)`);
        console.log(`   ✅ Verified: ${user.isVerified ? 'Yes' : 'No'}`);
        console.log(`   📅 Created: ${user.createdAt.toLocaleDateString()}`);
        console.log('');
      });
    }

    // Display employee accounts
    if (usersByType.employee.length > 0) {
      console.log('👷 EMPLOYEE ACCOUNTS:');
      console.log('='.repeat(50));
      usersByType.employee.forEach((user, index) => {
        console.log(`${index + 1}. 👤 ${user.firstName} ${user.lastName}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🔑 Password: password123 (test accounts)`);
        console.log(`   ✅ Verified: ${user.isVerified ? 'Yes' : 'No'}`);
        console.log(`   📅 Created: ${user.createdAt.toLocaleDateString()}`);
        console.log('');
      });
    }

    // Display both accounts
    if (usersByType.both.length > 0) {
      console.log('🔄 BOTH (Employee & Employer) ACCOUNTS:');
      console.log('='.repeat(50));
      usersByType.both.forEach((user, index) => {
        console.log(`${index + 1}. 👤 ${user.firstName} ${user.lastName}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🔑 Password: password123 (test accounts)`);
        console.log(`   ✅ Verified: ${user.isVerified ? 'Yes' : 'No'}`);
        console.log(`   📅 Created: ${user.createdAt.toLocaleDateString()}`);
        console.log('');
      });
    }

    console.log('📊 SUMMARY:');
    console.log('='.repeat(30));
    console.log(`👑 Admins: ${usersByType.admin.length}`);
    console.log(`🏢 Employers: ${usersByType.employer.length}`);
    console.log(`👷 Employees: ${usersByType.employee.length}`);
    console.log(`🔄 Both: ${usersByType.both.length}`);
    console.log(`📋 Total: ${users.length}`);

  } catch (error) {
    console.error('❌ Error listing users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

listAllUsers();
