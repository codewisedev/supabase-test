const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'secureAdminPassword123';

async function seedAdminUser () {
  try {
    console.log('Starting admin user seeding...');

    const { error: authError } = await supabase.auth.signUp({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      options: {
        data: {
          role: 'admin'
        }
      }
    });

    if (authError) {
      console.error('Error creating admin user:', authError.message);
      return;
    }

    console.log('Admin user successfully created!');
  } catch (error) {
    console.error('Unexpected error during admin user seeding:', error);
  }
}

seedAdminUser()
  .then(() => {
    console.log('Seeding process completed.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Seeding process failed:', err);
    process.exit(1);
  });

const CUSTOMER_EMAIL = 'test@example.com';
const CUSTOMER_PASSWORD = 'Test@123456';

async function seedCustomerUser () {
  try {
    console.log('Starting customer user seeding...');

    const { error: authError } = await supabase.auth.signUp({
      email: CUSTOMER_EMAIL,
      password: CUSTOMER_PASSWORD,
      options: {
        data: {
          role: 'customer'
        }
      }
    });

    if (authError) {
      console.error('Error creating customer user:', authError.message);
      return;
    }

    console.log('Customer user successfully created!');
  } catch (error) {
    console.error('Unexpected error during customer user seeding:', error);
  }
}

seedCustomerUser()
  .then(() => {
    console.log('Seeding process completed.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Seeding process failed:', err);
    process.exit(1);
  });