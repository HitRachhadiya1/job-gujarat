const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedAdminData() {
  try {
    console.log('🌱 Seeding admin data...');

    // Seed Categories
    const categories = [
      {
        name: 'Information Technology',
        description: 'Software development, web development, mobile apps, and IT services'
      },
      {
        name: 'Finance & Banking',
        description: 'Banking, accounting, financial services, and investment'
      },
      {
        name: 'Healthcare',
        description: 'Medical, nursing, pharmacy, and healthcare services'
      },
      {
        name: 'Education',
        description: 'Teaching, training, academic research, and educational services'
      },
      {
        name: 'Marketing & Sales',
        description: 'Digital marketing, sales, advertising, and business development'
      },
      {
        name: 'Engineering',
        description: 'Civil, mechanical, electrical, and other engineering disciplines'
      },
      {
        name: 'Manufacturing',
        description: 'Production, quality control, and manufacturing operations'
      },
      {
        name: 'Retail & E-commerce',
        description: 'Retail sales, customer service, and e-commerce operations'
      }
    ];

    console.log('📂 Creating categories...');
    for (const category of categories) {
      await prisma.category.upsert({
        where: { name: category.name },
        update: {},
        create: category
      });
    }

    // Seed Pricing Plans
    const pricingPlans = [
      {
        name: 'Basic Plan',
        price: 299,
        duration: 30,
        features: ['Single job posting', 'Basic visibility', '30-day listing', 'Email support'],
        popular: false
      },
      {
        name: 'Professional Plan',
        price: 599,
        duration: 60,
        features: ['Up to 3 job postings', 'Enhanced visibility', '60-day listing', 'Priority support', 'Application tracking'],
        popular: true
      },
      {
        name: 'Enterprise Plan',
        price: 1299,
        duration: 90,
        features: ['Unlimited job postings', 'Premium visibility', '90-day listing', 'Dedicated support', 'Advanced analytics', 'Company branding'],
        popular: false
      },
      {
        name: 'Startup Plan',
        price: 199,
        duration: 15,
        features: ['Single job posting', 'Basic visibility', '15-day listing', 'Email support'],
        popular: false
      }
    ];

    console.log('💰 Creating pricing plans...');
    for (const plan of pricingPlans) {
      await prisma.pricingPlan.upsert({
        where: { name: plan.name },
        update: {},
        create: plan
      });
    }

    console.log('✅ Admin data seeded successfully!');
    console.log(`📂 Created ${categories.length} categories`);
    console.log(`💰 Created ${pricingPlans.length} pricing plans`);

  } catch (error) {
    console.error('❌ Error seeding admin data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedAdminData();
