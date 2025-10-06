const Razorpay = require("razorpay");
const crypto = require("crypto");
const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order
async function createOrder(req, res) {
  try {
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const options = {
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return res.json(order);
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    return res.status(500).send("Error creating order");
  }
}

// Verify payment
function verifyPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing verification parameters" });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      return res.json({ success: true, message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }
  } catch (err) {
    console.error("Error verifying Razorpay payment:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// Public endpoint to fetch publishable key
function getPublicKey(req, res) {
  return res.json({ key: process.env.RAZORPAY_KEY_ID || "" });
}

// Verify payment and publish job (atomic)
async function confirmAndPublish(req, res) {
  try {
    const authUser = req.user;
    if (!authUser?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { payment, jobData, amount, order, pricingPlanId } = req.body || {};
    if (!payment?.razorpay_order_id || !payment?.razorpay_payment_id || !payment?.razorpay_signature) {
      return res.status(400).json({ error: "Missing payment fields" });
    }
    if (!jobData?.title || !jobData?.description || !jobData?.jobType) {
      return res.status(400).json({ error: "Incomplete job data" });
    }
    
    if (!pricingPlanId) {
      return res.status(400).json({ error: "Pricing plan must be selected to post a job" });
    }

    // Verify signature
    const body = `${payment.razorpay_order_id}|${payment.razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== payment.razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // Resolve internal user and company
    const user = await prisma.user.findFirst({ where: { email: authUser.email }, include: { Company: true } });
    if (!user || !user.Company) {
      return res.status(403).json({ error: "Company profile not found" });
    }

    // Block new plan purchase if an active plan already exists (no overlapping plans)
    const existingPurchase = await prisma.companyPlanPurchase.findFirst({
      where: { companyId: user.Company.id },
      orderBy: { createdAt: 'desc' },
      include: { pricingPlan: true },
    });
    if (existingPurchase) {
      const createdAt = new Date(existingPurchase.createdAt);
      const durationDays = Number(existingPurchase.pricingPlan?.duration || 0);
      const fallbackExpiry = durationDays > 0
        ? new Date(createdAt.getTime() + durationDays * 24 * 60 * 60 * 1000)
        : null;
      const effectiveExpiry = existingPurchase.expiryDate || fallbackExpiry;
      if (!effectiveExpiry || effectiveExpiry >= new Date()) {
        return res.status(409).json({ error: "Active plan already exists. Purchase a new plan after the current one expires." });
      }
    }


    // Fetch Razorpay order to capture accurate amount & currency (robust fallbacks)
    let capturedAmount = 0;
    let capturedCurrency = "INR";
    try {
      const fetchedOrder = await razorpay.orders.fetch(payment.razorpay_order_id);
      if (fetchedOrder?.amount) {
        capturedAmount = fetchedOrder.amount / 100; // paise -> rupees
        capturedCurrency = fetchedOrder.currency || "INR";
      }
    } catch (e) {
      console.warn("Could not fetch order details from Razorpay:", e.message);
      if (order?.amount) {
        capturedAmount = Number(order.amount) / 100; // Razorpay order amounts are in paise
        capturedCurrency = order.currency || "INR";
      } else {
        capturedAmount = Number(amount) || 0;
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Validate pricing plan and derive plan settings (optional)
      let planIdToUse = null;
      let planDurationDays = null;
      let totalJobsFromPlan = 1;
      let planPurchaseRecord = null;

      if (pricingPlanId) {
        try {
          const plan = await tx.pricingPlan.findUnique({ where: { id: pricingPlanId } });
          if (plan) {
            planIdToUse = plan.id;
            // Duration from plan
            planDurationDays = Number(plan.duration) || null;

            // Prefer explicit jobCount; fallback to parsing features
            let parsedFromFeatures = null;
            if (Array.isArray(plan.features)) {
              const jobsMatch = plan.features
                .map((f) => {
                  const m = String(f).toLowerCase().match(/(\d+)\s*(job|jobs|post|posts)/);
                  return m ? parseInt(m[1], 10) : null;
                })
                .filter((n) => Number.isFinite(n));
              if (jobsMatch.length > 0) parsedFromFeatures = jobsMatch[0];
            }
            totalJobsFromPlan = Number(plan.jobCount) || parsedFromFeatures || 1;

            // Create a CompanyPlanPurchase allocating credits; we'll consume 1 for this job now
            const startDate = new Date();
            const expiryDate = planDurationDays && planDurationDays > 0
              ? new Date(startDate.getTime() + planDurationDays * 24 * 60 * 60 * 1000)
              : null;
            planPurchaseRecord = await tx.companyPlanPurchase.create({
              data: {
                companyId: user.Company.id,
                pricingPlanId: plan.id,
                totalJobs: totalJobsFromPlan,
                usedJobs: 1,
                startDate,
                expiryDate,
              },
            });
          }
        } catch (e) {
          // ignore missing/invalid plan
        }
      }

      // Compute expiry: plan-based if available, else from provided jobData
      // Job expiry should be the plan's expiry date (all jobs under a plan expire together)
      let expiresAtToSet = planPurchaseRecord?.expiryDate || null;
      if (!expiresAtToSet && jobData.expiresAt) {
        expiresAtToSet = new Date(jobData.expiresAt);
      }

      const job = await tx.jobPosting.create({
        data: {
          companyId: user.Company.id,
          title: jobData.title,
          description: jobData.description,
          requirements: jobData.requirements || [],
          location: jobData.location || null,
          jobType: jobData.jobType,
          salaryRange: jobData.salaryRange || null,
          status: "PUBLISHED",
          expiresAt: expiresAtToSet,
          ...(planPurchaseRecord ? { planPurchaseId: planPurchaseRecord.id } : {}),
        },
      });

      // Ensure idempotency: if a record with the same transactionId exists, update/link it
      const existingTx = await tx.paymentTransaction.findUnique({
        where: { transactionId: payment.razorpay_payment_id },
      });

      if (!existingTx) {
        await tx.paymentTransaction.create({
          data: {
            companyId: user.Company.id,
            jobPostingId: job.id,
            ...(planIdToUse ? { pricingPlanId: planIdToUse } : {}),
            paymentType: "JOB_POSTING_FEE",
            gateway: "razorpay",
            transactionId: payment.razorpay_payment_id,
            amount: new Prisma.Decimal(capturedAmount),
            currency: capturedCurrency,
            status: "SUCCESS",
            completedAt: new Date(),
          },
        });
      } else {
        await tx.paymentTransaction.update({
          where: { transactionId: payment.razorpay_payment_id },
          data: {
            companyId: user.Company.id,
            jobPostingId: job.id,
            ...(planIdToUse ? { pricingPlanId: planIdToUse } : {}),
            paymentType: "JOB_POSTING_FEE",
            gateway: "razorpay",
            // Only overwrite amount/currency if missing
            ...(existingTx.amount == null ? { amount: new Prisma.Decimal(capturedAmount) } : {}),
            ...(existingTx.currency ? {} : { currency: capturedCurrency }),
            status: "SUCCESS",
            completedAt: existingTx.completedAt || new Date(),
          },
        });
      }

      return job;
    });

    return res.json({ success: true, job: result });
  } catch (err) {
    console.error("Error in confirmAndPublish:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// Create application fee payment (₹9)
async function createApplicationFeePayment(req, res) {
  try {
    // Check if job exists
    const job = await prisma.jobPosting.findUnique({
      where: { id: order.jobId }
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Get jobseeker profile
    const user = await prisma.user.findFirst({ 
      where: { email: authUser.email }, 
      include: { JobSeeker: true } 
    });

    if (!user || !user.JobSeeker) {
      return res.status(403).json({ error: "JobSeeker profile not found" });
    }

    // Check if already applied
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        jobId: jobId,
        jobSeekerId: user.JobSeeker.id
      }
    });

    if (existingApplication) {
      return res.status(400).json({ error: "Already applied to this job" });
    }

    // Create Razorpay order for ₹9
    const options = {
      amount: 900, // ₹9 in paise
      currency: "INR",
      receipt: `app_fee_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return res.json(order);
  } catch (err) {
    console.error("Error creating application fee payment:", err);
    return res.status(500).json({ error: "Error creating payment" });
  }
}

// Confirm application fee payment and create job application
async function confirmApplicationPayment(req, res) {
  try {
    const authUser = req.user;
    if (!authUser?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { payment, jobId, coverLetter, resumeUrl } = req.body || {};
    if (!payment?.razorpay_order_id || !payment?.razorpay_payment_id || !payment?.razorpay_signature) {
      return res.status(400).json({ error: "Missing payment fields" });
    }
    if (!jobId) {
      return res.status(400).json({ error: "Job ID is required" });
    }

    // Verify signature
    const body = `${payment.razorpay_order_id}|${payment.razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== payment.razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // Get user and jobseeker
    const user = await prisma.user.findFirst({ 
      where: { email: authUser.email }, 
      include: { JobSeeker: true } 
    });

    if (!user || !user.JobSeeker) {
      return res.status(403).json({ error: "JobSeeker profile not found" });
    }

    // Check if job exists
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create job application
      const application = await tx.jobApplication.create({
        data: {
          jobId: jobId,
          jobSeekerId: user.JobSeeker.id,
          status: "APPLIED",
          coverLetter: coverLetter || null,
          // Prefer the per-application resume URL if provided
          resumeSnapshot: resumeUrl || user.JobSeeker.resumeUrl || null,
        },
      });

      // Create payment transaction
      await tx.paymentTransaction.create({
        data: {
          jobSeekerId: user.JobSeeker.userId,
          jobPostingId: jobId,
          applicationId: application.id,
          paymentType: "APPLICATION_FEE",
          gateway: "Razorpay",
          transactionId: payment.razorpay_payment_id,
          amount: new Prisma.Decimal(9),
          currency: "INR",
          status: "SUCCESS",
        },
      });

      // Return the application populated with its related job
      const populated = await tx.jobApplication.findUnique({
        where: { id: application.id },
        include: { job: true }
      });

      return populated;
    });

    return res.json({ success: true, application: result });
  } catch (err) {
    console.error("Error in confirmApplicationPayment:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// Create approval fee payment order
async function createApprovalFeeOrder(req, res) {
  try {
    const authUser = req.user;
    if (!authUser?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { amount, applicationId, paymentType } = req.body;
    if (!amount || !applicationId || paymentType !== 'APPROVAL_FEE') {
      return res.status(400).json({ error: "Invalid payment data" });
    }

    // Verify the application belongs to the user and is HIRED
    const user = await prisma.user.findFirst({ 
      where: { email: authUser.email }, 
      include: { JobSeeker: true } 
    });

    if (!user || !user.JobSeeker) {
      return res.status(403).json({ error: "JobSeeker profile not found" });
    }

    const application = await prisma.jobApplication.findFirst({
      where: {
        id: applicationId,
        jobSeekerId: user.JobSeeker.id,
        status: "HIRED"
      }
    });

    if (!application) {
      return res.status(404).json({ error: "Hired application not found" });
    }

    // Create Razorpay order
    // Build a compact receipt: "af_<8charId>_<last8ts>" (always < 40 chars)
    const shortId = String(applicationId).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
    const shortTs = Date.now().toString().slice(-8);
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt: `af_${shortId}_${shortTs}`,
    };

    const order = await razorpay.orders.create(options);
    return res.json(order);
  } catch (err) {
    console.error("Error creating approval fee order:", err);
    return res.status(500).json({ error: "Error creating payment order" });
  }
}

// Verify approval fee payment
async function verifyApprovalPayment(req, res) {
  try {
    const authUser = req.user;
    if (!authUser?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, applicationId } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !applicationId) {
      return res.status(400).json({ error: "Missing payment verification data" });
    }

    // Verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // Get user and verify application
    const user = await prisma.user.findFirst({ 
      where: { email: authUser.email }, 
      include: { JobSeeker: true } 
    });

    if (!user || !user.JobSeeker) {
      return res.status(403).json({ error: "JobSeeker profile not found" });
    }

    const application = await prisma.jobApplication.findFirst({
      where: {
        id: applicationId,
        jobSeekerId: user.JobSeeker.id,
        status: "HIRED"
      },
      include: {
        job: {
          include: {
            company: true
          }
        }
      }
    });

    if (!application) {
      return res.status(404).json({ error: "Hired application not found" });
    }

    // Get order details from Razorpay to get the amount
    const order = await razorpay.orders.fetch(razorpay_order_id);

    // Create payment transaction record
    await prisma.paymentTransaction.create({
      data: {
        jobSeekerId: user.JobSeeker.userId,
        applicationId: applicationId,
        paymentType: "APPROVAL_FEE",
        gateway: "razorpay",
        transactionId: razorpay_payment_id,
        amount: new Prisma.Decimal(order.amount / 100), // Convert from paise to rupees
        currency: "INR",
        status: "SUCCESS",
        completedAt: new Date()
      },
    });

    return res.json({ 
      success: true, 
      message: "Payment verified successfully",
      application: application
    });
  } catch (err) {
    console.error("Error verifying approval payment:", err);
    return res.status(500).json({ error: "Payment verification failed" });
  }
}

// Confirm a plan purchase WITHOUT creating a job posting
async function confirmPlanPurchase(req, res) {
  try {
    const authUser = req.user;
    if (!authUser?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { payment, amount, order, pricingPlanId } = req.body || {};
    if (!payment?.razorpay_order_id || !payment?.razorpay_payment_id || !payment?.razorpay_signature) {
      return res.status(400).json({ error: "Missing payment fields" });
    }
    if (!pricingPlanId) {
      return res.status(400).json({ error: "Pricing plan must be selected" });
    }

    // Verify signature
    const body = `${payment.razorpay_order_id}|${payment.razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== payment.razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // Resolve internal user and company
    const user = await prisma.user.findFirst({ where: { email: authUser.email }, include: { Company: true } });
    if (!user || !user.Company) {
      return res.status(403).json({ error: "Company profile not found" });
    }

    // Block new plan purchase if an active plan already exists (no overlapping plans)
    const activeOrLatest = await prisma.companyPlanPurchase.findFirst({
      where: { companyId: user.Company.id },
      orderBy: { createdAt: 'desc' },
      include: { pricingPlan: true },
    });
    if (activeOrLatest) {
      const createdAt = new Date(activeOrLatest.createdAt);
      const durationDays = Number(activeOrLatest.pricingPlan?.duration || 0);
      const fallbackExpiry = durationDays > 0
        ? new Date(createdAt.getTime() + durationDays * 24 * 60 * 60 * 1000)
        : null;
      const effectiveExpiry = activeOrLatest.expiryDate || fallbackExpiry;
      if (!effectiveExpiry || effectiveExpiry >= new Date()) {
        return res.status(409).json({ error: "Active plan already exists. Purchase a new plan after the current one expires." });
      }
    }

    // Capture amount and currency from Razorpay order (fallbacks supported)
    let capturedAmount = 0;
    let capturedCurrency = "INR";
    try {
      const fetchedOrder = await razorpay.orders.fetch(payment.razorpay_order_id);
      if (fetchedOrder?.amount) {
        capturedAmount = fetchedOrder.amount / 100;
        capturedCurrency = fetchedOrder.currency || "INR";
      }
    } catch (e) {
      if (order?.amount) {
        capturedAmount = Number(order.amount) / 100;
        capturedCurrency = order.currency || "INR";
      } else {
        capturedAmount = Number(amount) || 0;
      }
    }

    const purchase = await prisma.$transaction(async (tx) => {
      // Validate pricing plan
      const plan = await tx.pricingPlan.findUnique({ where: { id: pricingPlanId } });
      if (!plan) {
        throw new Error("Pricing plan not found");
      }

      const startDate = new Date();
      const durationDays = Number(plan.duration) || 0;
      const expiryDate = durationDays > 0 ? new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000) : null;
      const totalJobs = Number(plan.jobCount) || 1;

      // Create purchase with full credits (no consumption now)
      const purchaseRecord = await tx.companyPlanPurchase.create({
        data: {
          companyId: user.Company.id,
          pricingPlanId: plan.id,
          totalJobs,
          usedJobs: 0,
          startDate,
          expiryDate,
        },
        include: { pricingPlan: true },
      });

      // Record payment transaction
      const existingTx = await tx.paymentTransaction.findUnique({
        where: { transactionId: payment.razorpay_payment_id },
      });
      if (!existingTx) {
        await tx.paymentTransaction.create({
          data: {
            companyId: user.Company.id,
            pricingPlanId: plan.id,
            paymentType: "SUBSCRIPTION_FEE",
            gateway: "razorpay",
            transactionId: payment.razorpay_payment_id,
            amount: new Prisma.Decimal(capturedAmount),
            currency: capturedCurrency,
            status: "SUCCESS",
            completedAt: new Date(),
          },
        });
      }

      return purchaseRecord;
    });

    return res.json({ success: true, purchase });
  } catch (err) {
    console.error("Error confirming plan purchase:", err);
    return res.status(500).json({ error: "Plan purchase confirmation failed" });
  }
}

module.exports = { 
  createOrder, 
  verifyPayment, 
  getPublicKey, 
  confirmAndPublish,
  confirmPlanPurchase,
  createApplicationFeePayment,
  confirmApplicationPayment,
  createApprovalFeeOrder,
  verifyApprovalPayment
};
