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

    const { payment, jobData, amount, order } = req.body || {};
    if (!payment?.razorpay_order_id || !payment?.razorpay_payment_id || !payment?.razorpay_signature) {
      return res.status(400).json({ error: "Missing payment fields" });
    }
    if (!jobData?.title || !jobData?.description || !jobData?.jobType) {
      return res.status(400).json({ error: "Incomplete job data" });
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

    const totalAmount = Number(amount);

    const result = await prisma.$transaction(async (tx) => {
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
          expiresAt: jobData.expiresAt ? new Date(jobData.expiresAt) : null,
        },
      });

      await tx.paymentTransaction.create({
        data: {
          companyId: user.Company.id,
          jobPostingId: job.id,
          paymentType: "JOB_POSTING_FEE",
          gateway: "Razorpay",
          transactionId: payment.razorpay_payment_id,
          amount: new Prisma.Decimal(totalAmount),
          currency: "INR",
          status: "SUCCESS",
        },
      });

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
    const authUser = req.user;
    if (!authUser?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({ error: "Job ID is required" });
    }

    // Check if job exists
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId }
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

module.exports = { 
  createOrder, 
  verifyPayment, 
  getPublicKey, 
  confirmAndPublish,
  createApplicationFeePayment,
  confirmApplicationPayment
};
