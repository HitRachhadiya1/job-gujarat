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

module.exports = { createOrder, verifyPayment, getPublicKey, confirmAndPublish };
