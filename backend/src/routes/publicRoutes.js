const express = require('express');
const { getAppLogo } = require('../controllers/adminController');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Public route to get app logo
router.get('/app-logo', getAppLogo);

// Public route to get active categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        description: true
      },
      orderBy: { name: 'asc' }
    });

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Public route to get active pricing plans
router.get('/pricing-plans', async (req, res) => {
  try {
    const pricingPlans = await prisma.pricingPlan.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        price: true,
        duration: true,
        features: true,
        popular: true
      },
      orderBy: { price: 'asc' }
    });

    res.json(pricingPlans);
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    res.status(500).json({ error: 'Failed to fetch pricing plans' });
  }
});

module.exports = router;
