const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const AdminUser = require('./models/AdminUser');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/digital';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    AdminUser.findOne({ email: 'admin@cleanindia.com' })
      .then(admin => {
        if (admin) {
          console.log('Admin user exists. Updating password...');
          const salt = bcrypt.genSaltSync(10);
          admin.password = bcrypt.hashSync('11223344', salt);
          return admin.save().then(() => {
            console.log('Admin password updated successfully');
            process.exit(0);
          });
        }

        // Create default admin user
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync('admin123', salt);

        const adminUser = new AdminUser({
          name: 'System Administrator',
          email: 'admin@cleanindia.com',
          phone: '9876543210',
          designation: 'System Admin',
          municipal_id: 'ADMIN001',
          department: 'System Administration',
          password: hashedPassword
        });

        adminUser.save()
          .then(() => {
            console.log('Admin user created successfully');
            process.exit(0);
          })
          .catch(err => {
            console.error('Error creating admin user:', err);
            process.exit(1);
          });
      })
      .catch(err => {
        console.error('Error checking admin user:', err);
        process.exit(1);
      });
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });