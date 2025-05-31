import mongoose from 'mongoose';
import { config } from 'dotenv';
import { resolve } from 'path';
import Users from '@/models/user'; // Import your Users model

// Load environment variables
config({ path: resolve(process.cwd(), '.env') });

async function migrate() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/yourdbname', {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000
    });
    console.log('✔ Connected to MongoDB');

    // 2. Get all consultants
    const consultants = await Users.find({ role: 'Consultant' });
    console.log(`Found ${consultants.length} consultants to update`);

    // 3. Prepare blank fields
    const blankFields = {
      phone: "",
      yearsOfExperience: 0,
      bio: "",
      status: "Active",
      country: "",
      address: ""
    };

    // 4. Update only documents missing these fields
    const result = await Users.updateMany(
      { 
        role: 'Consultant',
        $or: [
          { phone: { $exists: false } },
          { yearsOfExperience: { $exists: false } },
          { bio: { $exists: false } },
          { status: { $exists: false } },
          { country: { $exists: false } },
          { address: { $exists: false } }
        ]
      },
      { $set: blankFields }
    );

    console.log(`✔ Successfully updated ${result.modifiedCount} consultants`);
    console.log('Added fields:', Object.keys(blankFields).join(', '));

  } catch (err) {
    console.error('❌ Migration error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run the migration
await migrate();