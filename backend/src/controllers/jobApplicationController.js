const { PrismaClient } = require("@prisma/client");
const { uploadFile } = require("../services/supabaseService");
const multer = require('multer');

const prisma = new PrismaClient();

// Calculate approval fee based on monthly salary
const calculateApprovalFee = (monthlySalary) => {
  const salary = parseFloat(monthlySalary);
  
  if (salary < 10000) {
    return 250;
  } else if (salary >= 10000 && salary < 20000) {
    return 400;
  } else if (salary >= 20000 && salary < 30000) {
    return 500;
  } else {
    return 600;
  }
};

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Check if resume exists for a specific job application
const checkApplicationResume = async (req, res) => {
  try {
    const auth0User = req.user;
    const { jobId } = req.params;
    
    if (!auth0User?.email) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    // Get user from database
    const dbUser = await prisma.user.findFirst({ where: { email: auth0User.email } });
    if (!dbUser) {
      return res.status(404).json({ error: "User record not found" });
    }

    // Get jobSeeker profile
    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId: dbUser.id }
    });

    if (!jobSeeker) {
      return res.json({ hasResume: false, resumeUrl: null });
    }

    // Check if resume file exists for this specific job
    const fileExtension = 'pdf'; // We only accept PDFs
    const fileName = `applications/${jobSeeker.id}_${jobId}.${fileExtension}`;
    
    console.log(`Checking for resume file: ${fileName} for jobSeeker: ${jobSeeker.id}, job: ${jobId}`);
    
    try {
      // Check if file exists in Supabase storage
      const { data, error } = await supabase.storage
        .from('resumes')
        .list('applications', {
          search: `${jobSeeker.id}_${jobId}.${fileExtension}`
        });

      console.log('File search result:', { data, error });

      if (error) {
        console.error('Error checking file existence:', error);
        return res.json({ hasResume: false, resumeUrl: null });
      }

      // If file exists, get its public URL
      if (data && data.length > 0) {
        const { data: urlData } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);

        return res.json({ 
          hasResume: true, 
          resumeUrl: urlData.publicUrl,
          fileName: `resume_${jobId}.pdf`
        });
      }

      res.json({ hasResume: false, resumeUrl: null });
    } catch (storageError) {
      console.error('Storage check error:', storageError);
      res.json({ hasResume: false, resumeUrl: null });
    }
  } catch (error) {
    console.error("Error checking application resume:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Upload resume for job application
const uploadApplicationResume = async (req, res) => {
  try {
    const auth0User = req.user;
    
    if (!auth0User?.email) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({ error: "Job ID is required" });
    }

    // Validate file type and size
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: "Resume must be a PDF file" });
    }

    if (req.file.size > 2 * 1024 * 1024) { // 2MB
      return res.status(400).json({ error: "Resume file size must be less than 2MB" });
    }

    // Get user from database
    const dbUser = await prisma.user.findFirst({ where: { email: auth0User.email } });
    if (!dbUser) {
      return res.status(404).json({ error: "User record not found" });
    }

    // Get or create jobSeeker profile
    let jobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId: dbUser.id }
    });

    if (!jobSeeker) {
      // Create a basic profile if it doesn't exist
      jobSeeker = await prisma.jobSeeker.create({
        data: {
          userId: dbUser.id,
          fullName: auth0User.name || auth0User.email || "User",
          phone: null,
          location: null,
          skills: [],
          experienceYears: null,
          resumeUrl: null,
          profilePhotoUrl: null,
        },
      });
    }

    // Create application-specific file path in resumes bucket
    // Format: applications/{jobSeekerId}_{jobId}_{originalName}
    const originalName = req.file.originalname;
    const fileExtension = originalName.split('.').pop();
    const baseName = originalName.replace(`.${fileExtension}`, '');
    const fileName = `applications/${jobSeeker.id}_${jobId}_${baseName}.${fileExtension}`;
    
    // Delete existing file if it exists (to replace with new one)
    try {
      await supabase.storage
        .from('resumes')
        .remove([fileName]);
    } catch (deleteError) {
      // Ignore delete errors (file might not exist)
      console.log('File deletion info:', deleteError.message);
    }

    // Upload to Supabase resumes bucket with applications subfolder
    const uploadResult = await uploadFile(
      'resumes',
      fileName,
      req.file.buffer,
      req.file.mimetype
    );

    if (uploadResult.error) {
      return res.status(500).json({ error: uploadResult.error });
    }

    res.json({
      message: "Resume uploaded successfully",
      resumeUrl: uploadResult.url
    });
  } catch (error) {
    console.error("Error uploading application resume:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Apply for a job
const applyForJob = async (req, res) => {
  try {
    const { jobId, coverLetter, resumeUrl } = req.body;
    const auth0User = req.user;

    // Check if user has JOB_SEEKER role from Auth0 data
    if (!auth0User || auth0User.role !== "JOB_SEEKER") {
      return res.status(403).json({
        error: "Only job seekers can apply for jobs. Please complete your role selection first.",
      });
    }

    if (!auth0User.email) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    // Resolve internal DB user by email
    let dbUser = await prisma.user.findFirst({ where: { email: auth0User.email } });
    if (!dbUser) {
      // Ensure a user record exists for this email
      dbUser = await prisma.user.create({
        data: { email: auth0User.email, role: "JOB_SEEKER" },
      });
    }

    // Check if job seeker profile exists
    const jobSeekerProfile = await prisma.jobSeeker.findUnique({
      where: { userId: dbUser.id },
    });

    if (!jobSeekerProfile) {
      return res.status(403).json({
        error: "Please complete your job seeker profile before applying for jobs.",
        requiresProfile: true,
        action: "CREATE_PROFILE"
      });
    }

    // Check if job exists and is published
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      include: { company: true }
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.status !== "PUBLISHED") {
      return res.status(400).json({ error: "This job is not available for applications" });
    }

    // Check if already applied
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        jobId,
        jobSeekerId: jobSeekerProfile.id
      }
    });

    if (existingApplication) {
      return res.status(400).json({ error: "You have already applied for this job" });
    }

    // Validate resume URL is provided
    if (!resumeUrl) {
      return res.status(400).json({ error: "Resume is required to apply for this job" });
    }

    // Create job application with application-specific resume
    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        jobSeekerId: jobSeekerProfile.id,
        coverLetter: coverLetter || null,
        resumeSnapshot: resumeUrl, // Use the application-specific resume URL
        status: "APPLIED"
      },
      include: {
        job: {
          include: {
            company: {
              select: {
                name: true,
                logoUrl: true
              }
            }
          }
        },
        jobSeeker: {
          select: {
            fullName: true,
            phone: true,
            location: true,
            skills: true,
            experienceYears: true
          }
        }
      }
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application
    });

  } catch (error) {
    console.error("Error applying for job:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get job seeker's applications
const getMyApplications = async (req, res) => {
  try {
    const auth0User = req.user;
    const { status, page = 1, limit = 10 } = req.query;

    if (!auth0User?.email) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    // Get job seeker info
    const user = await prisma.user.findFirst({
      where: { email: auth0User.email },
      include: { JobSeeker: true },
    });

    // If no job seeker profile exists yet, return empty results
    if (!user || !user.JobSeeker) {
      return res.json({
        applications: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: 0
        }
      });
    }

    // Build where clause
    const where = {
      jobSeekerId: user.JobSeeker.id
    };

    if (status && ["APPLIED", "INTERVIEW", "HIRED", "REJECTED"].includes(status)) {
      where.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, total] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        include: {
          job: {
            select: {
              title: true,
              location: true,
              jobType: true,
              company: {
                select: {
                  name: true,
                  logoUrl: true,
                },
              },
            },
          },
        },
        orderBy: { appliedAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.jobApplication.count({ where }),
    ]);

    res.json({
      applications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get applications for a company's jobs
const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    const auth0User = req.user;

    if (!auth0User?.email) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    // Resolve internal user and ensure company profile exists
    const user = await prisma.user.findFirst({
      where: { email: auth0User.email },
      include: { Company: true },
    });

    if (!user || !user.Company) {
      return res.status(403).json({ error: "Company profile not found" });
    }

    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId }
    });

    if (!job || job.companyId !== user.Company.id) {
      return res.status(404).json({ error: "Job not found or not authorized" });
    }

    // Build where clause
    const where = {
      jobId
    };

    if (status && ["APPLIED", "INTERVIEW", "HIRED", "REJECTED"].includes(status)) {
      where.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, total] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        include: {
          jobSeeker: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              location: true,
              skills: true,
              experienceYears: true,
              resumeUrl: true
            }
          },
          job: {
            select: {
              title: true,
              location: true
            }
          }
        },
        orderBy: { appliedAt: "desc" },
        skip,
        take: parseInt(limit)
      }),
      prisma.jobApplication.count({ where })
    ]);

    res.json({
      applications,
      job: {
        title: job.title,
        location: job.location
      },
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error("Error fetching job applications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update application status (company only)
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, notes } = req.body;
    const auth0User = req.user;

    console.log("Update application status request:", {
      applicationId,
      status,
      userEmail: auth0User?.email,
      userRole: auth0User?.role
    });

    if (!["APPLIED", "INTERVIEW", "HIRED", "REJECTED"].includes(status)) {
      console.log("Invalid status provided:", status);
      return res.status(400).json({ error: "Invalid status" });
    }

    if (!auth0User?.email) {
      console.log("No user email found in token");
      return res.status(400).json({ error: "User email not found in token" });
    }

    // Check if user is company owner
    console.log("Finding user by email:", auth0User.email);
    const user = await prisma.user.findFirst({
      where: { email: auth0User.email },
      include: { Company: true },
    });

    console.log("Found user:", user ? { id: user.id, email: user.email, hasCompany: !!user.Company } : null);

    if (!user || !user.Company) {
      console.log("Company profile not found for user");
      return res.status(403).json({ error: "Company profile not found" });
    }

    // Check if application belongs to company's job
    console.log("Finding application by ID:", applicationId);
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        jobSeeker: {
          select: {
            fullName: true,
            user: {
              select: {
                email: true
              }
            }
          }
        }
      }
    });

    console.log("Found application:", application ? {
      id: application.id,
      jobId: application.jobId,
      jobCompanyId: application.job?.companyId,
      userCompanyId: user.Company.id
    } : null);

    if (!application) {
      console.log("Application not found");
      return res.status(404).json({ error: "Application not found" });
    }

    if (application.job.companyId !== user.Company.id) {
      console.log("Application does not belong to user's company");
      return res.status(403).json({ error: "Not authorized to update this application" });
    }

    // Update application status
    console.log("Updating application status to:", status);
    const updatedApplication = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { 
        status,
        updatedAt: new Date()
      },
      include: {
        job: {
          select: {
            title: true,
            location: true
          }
        },
        jobSeeker: {
          select: {
            fullName: true,
            phone: true,
            location: true,
            skills: true,
            experienceYears: true
          }
        }
      }
    });

    console.log("Application status updated successfully");

    res.json({
      message: "Application status updated successfully",
      application: updatedApplication
    });

  } catch (error) {
    console.error("Error updating application status:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

// Get all applications for company's jobs (dashboard overview)
const getCompanyApplications = async (req, res) => {
  try {
    const auth0User = req.user;
    const { status, page = 1, limit = 20 } = req.query;

    if (!auth0User?.email) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    // Check if user is company owner
    const user = await prisma.user.findFirst({
      where: { email: auth0User.email },
      include: { Company: true },
    });

    if (!user || !user.Company) {
      return res.status(403).json({ error: "Company profile not found" });
    }

    // Build where clause
    const where = {
      job: {
        companyId: user.Company.id
      }
    };

    if (status && ["APPLIED", "INTERVIEW", "HIRED", "REJECTED"].includes(status)) {
      where.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, total] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        select: {
          id: true,
          status: true,
          appliedAt: true,
          updatedAt: true,
          coverLetter: true,
          resumeSnapshot: true,
          job: {
            select: {
              title: true,
              location: true,
              jobType: true
            }
          },
          jobSeeker: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              location: true,
              skills: true,
              experienceYears: true
            }
          }
        },
        orderBy: { appliedAt: "desc" },
        skip,
        take: parseInt(limit)
      }),
      prisma.jobApplication.count({ where })
    ]);

    // Get application statistics
    const stats = await prisma.jobApplication.groupBy({
      by: ['status'],
      where: {
        job: {
          companyId: user.Company.id
        }
      },
      _count: {
        status: true
      }
    });

    const applicationStats = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {});

    res.json({
      applications,
      stats: applicationStats,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error("Error fetching company applications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Withdraw application (job seeker only)
const withdrawApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const auth0User = req.user;

    if (!auth0User?.email) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    // Check if user has a job seeker profile; role is enforced by middleware
    const user = await prisma.user.findFirst({
      where: { email: auth0User.email },
      include: { JobSeeker: true },
    });

    if (!user || !user.JobSeeker) {
      return res.status(403).json({ error: "Job seeker profile not found" });
    }

    // Check if application belongs to job seeker
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          select: {
            title: true
          }
        }
      }
    });

    if (!application || application.jobSeekerId !== user.JobSeeker.id) {
      return res.status(404).json({ error: "Application not found or not authorized" });
    }

    // Only allow withdrawal if status is APPLIED
    if (application.status !== "APPLIED") {
      return res.status(400).json({ 
        error: "Application cannot be withdrawn at this stage" 
      });
    }

    // Delete resume file from Supabase storage if it exists
    if (application.resumeSnapshot) {
      try {
        console.log('=== RESUME DELETION DEBUG ===');
        console.log('Resume URL:', application.resumeSnapshot);
        
        // Extract file path from URL - handle multiple formats
        let filePath = '';
        
        if (application.resumeSnapshot.includes('supabase.co/storage/v1/object/public/resumes/')) {
          // Full Supabase URL: https://xxx.supabase.co/storage/v1/object/public/resumes/applications/123_456_resume.pdf
          const url = new URL(application.resumeSnapshot);
          const pathParts = url.pathname.split('/');
          console.log('URL path parts:', pathParts);
          
          const resumesIndex = pathParts.indexOf('resumes');
          if (resumesIndex >= 0 && resumesIndex < pathParts.length - 1) {
            filePath = pathParts.slice(resumesIndex + 1).join('/');
          }
        } else if (application.resumeSnapshot.startsWith('applications/')) {
          // Direct path: applications/123_456_resume.pdf
          filePath = application.resumeSnapshot;
        } else {
          // Try to extract from any URL format
          const parts = application.resumeSnapshot.split('/');
          const applicationsIndex = parts.indexOf('applications');
          if (applicationsIndex >= 0) {
            filePath = parts.slice(applicationsIndex).join('/');
          }
        }
        
        console.log('Extracted file path:', filePath);
        
        if (filePath) {
          console.log('Attempting to delete from resumes bucket:', filePath);
          
          const { data, error: deleteError } = await supabase.storage
            .from('resumes')
            .remove([filePath]);
          
          console.log('Delete response data:', data);
          
          if (deleteError) {
            console.error('Error deleting resume file:', deleteError);
            console.error('Delete error details:', JSON.stringify(deleteError, null, 2));
          } else {
            console.log('Successfully deleted resume file:', filePath);
          }
        } else {
          console.log('No valid file path found for deletion');
        }
        
        console.log('=== END RESUME DELETION DEBUG ===');
      } catch (fileError) {
        console.error('Error processing resume file deletion:', fileError);
        // Don't fail the withdrawal if file deletion fails
      }
    } else {
      console.log('No resume snapshot found on application');
    }

    // Delete the application
    await prisma.jobApplication.delete({
      where: { id: applicationId }
    });

    res.json({
      message: `Application for "${application.job.title}" has been withdrawn successfully`
    });

  } catch (error) {
    console.error("Error withdrawing application:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Upload Aadhaar document for hired application
const uploadAadhaarDocument = async (req, res) => {
  try {
    const auth0User = req.user;
    
    if (!auth0User?.email) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    if (!req.files || !req.files.front || !req.files.back) {
      return res.status(400).json({ error: "Both front and back images are required" });
    }

    const { applicationId } = req.body;
    if (!applicationId) {
      return res.status(400).json({ error: "Application ID is required" });
    }

    // Validate file types and sizes
    const frontFile = req.files.front[0];
    const backFile = req.files.back[0];

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 3 * 1024 * 1024; // 3MB

    if (!allowedTypes.includes(frontFile.mimetype) || !allowedTypes.includes(backFile.mimetype)) {
      return res.status(400).json({ error: "Aadhaar images must be JPEG or PNG files" });
    }

    if (frontFile.size > maxSize || backFile.size > maxSize) {
      return res.status(400).json({ error: "Each Aadhaar image must be less than 3MB" });
    }

    // Get user from database
    const dbUser = await prisma.user.findFirst({ where: { email: auth0User.email } });
    if (!dbUser) {
      return res.status(404).json({ error: "User record not found" });
    }

    // Get jobSeeker profile
    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId: dbUser.id }
    });

    if (!jobSeeker) {
      return res.status(404).json({ error: "Job seeker profile not found" });
    }

    // Verify application exists and is HIRED
    const application = await prisma.jobApplication.findFirst({
      where: {
        id: applicationId,
        jobSeekerId: jobSeeker.id,
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

    // Check if approval fee is paid before allowing Aadhaar upload
    const approvalPayment = await prisma.paymentTransaction.findFirst({
      where: {
        applicationId: applicationId,
        status: "SUCCESS",
        paymentType: "APPROVAL_FEE"
      }
    });

    if (!approvalPayment) {
      return res.status(403).json({ 
        error: "Approval fee must be paid before uploading Aadhaar documents",
        requiresPayment: true,
        applicationId: applicationId
      });
    }

    // Create job seeker-specific file paths (reusable across all applications)
    // Structure: jobseeker/{jobSeekerId}/aadhaar_front.jpg
    const frontFileName = `jobseeker/${jobSeeker.id}/aadhaar_front.${frontFile.originalname.split('.').pop()}`;
    const backFileName = `jobseeker/${jobSeeker.id}/aadhaar_back.${backFile.originalname.split('.').pop()}`;

    console.log('=== AADHAAR UPLOAD DEBUG ===');
    console.log('Job Seeker ID:', jobSeeker.id);
    console.log('Application ID:', applicationId);
    console.log('Front file path:', frontFileName);
    console.log('Back file path:', backFileName);
    console.log('This will overwrite existing Aadhaar documents for this job seeker');

    // Upload front image to 'Aadhar Card' bucket
    const frontUploadResult = await uploadFile(
      'Aadhar Card',
      frontFileName,
      frontFile.buffer,
      frontFile.mimetype
    );

    if (frontUploadResult.error) {
      console.error('Front upload error:', frontUploadResult.error);
      return res.status(500).json({ error: `Failed to upload front image: ${frontUploadResult.error}` });
    }

    console.log('Front upload success:', frontUploadResult.url);

    // Upload back image to 'Aadhar Card' bucket
    const backUploadResult = await uploadFile(
      'Aadhar Card',
      backFileName,
      backFile.buffer,
      backFile.mimetype
    );

    if (backUploadResult.error) {
      console.error('Back upload error:', backUploadResult.error);
      return res.status(500).json({ error: `Failed to upload back image: ${backUploadResult.error}` });
    }

    console.log('Back upload success:', backUploadResult.url);
    console.log('=== END AADHAAR UPLOAD DEBUG ===');

    // Update JobSeeker profile with Aadhaar document URLs (stored centrally - overwrites existing)
    const updatedJobSeeker = await prisma.jobSeeker.update({
      where: { id: jobSeeker.id },
      data: {
        aadhaarDocumentUrl: JSON.stringify({
          front: frontUploadResult.url,
          back: backUploadResult.url,
          uploadedAt: new Date().toISOString(),
          applicationId: applicationId // Track which application triggered this upload
        })
      }
    });

    // Also update the current application to mark it has Aadhaar uploaded
    const updatedApplication = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        aadhaarDocumentUrl: JSON.stringify({
          front: frontUploadResult.url,
          back: backUploadResult.url,
          uploadedAt: new Date().toISOString()
        })
      },
      include: {
        job: {
          include: {
            company: true
          }
        }
      }
    });

    console.log('Aadhaar documents uploaded and JobSeeker profile updated');
    console.log('JobSeeker aadhaarDocumentUrl updated:', updatedJobSeeker.aadhaarDocumentUrl);

    res.json({
      message: "Aadhaar documents uploaded successfully and will be reused for future applications",
      application: updatedApplication,
      aadhaarUrls: {
        front: frontUploadResult.url,
        back: backUploadResult.url
      }
    });

  } catch (error) {
    console.error('Error uploading Aadhaar documents:', error);
    res.status(500).json({ error: "Failed to upload Aadhaar documents" });
  }
};

// Get approval fee information for hired application
const getApprovalFeeInfo = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const auth0User = req.user;

    if (!auth0User?.email) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    // Get user from database
    const dbUser = await prisma.user.findFirst({ where: { email: auth0User.email } });
    if (!dbUser) {
      return res.status(404).json({ error: "User record not found" });
    }

    // Get jobSeeker profile
    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId: dbUser.id }
    });

    if (!jobSeeker) {
      return res.status(404).json({ error: "Job seeker profile not found" });
    }

    // Get application and verify it belongs to job seeker and is HIRED
    const application = await prisma.jobApplication.findFirst({
      where: {
        id: applicationId,
        jobSeekerId: jobSeeker.id,
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

    // Extract salary from job description or use a default
    // You might want to add a salary field to JobPosting model
    const salaryRange = application.job.salaryRange || "15000"; // Default if not specified
    const monthlySalary = parseFloat(salaryRange.replace(/[^\d.]/g, '')) || 15000;
    
    const approvalFee = calculateApprovalFee(monthlySalary);

    // Check if approval fee is already paid
    const existingPayment = await prisma.paymentTransaction.findFirst({
      where: {
        applicationId: applicationId,
        status: "SUCCESS"
      }
    });

    res.json({
      applicationId,
      jobTitle: application.job.title,
      companyName: application.job.company.name,
      monthlySalary,
      approvalFee,
      currency: "INR",
      isPaid: !!existingPayment,
      paymentId: existingPayment?.id || null,
      feeBreakdown: {
        "Below ₹10,000": 250,
        "₹10,000 - ₹20,000": 400,
        "₹20,000 - ₹30,000": 500,
        "Above ₹30,000": 600,
        "Your Range": `₹${approvalFee}`
      }
    });

  } catch (error) {
    console.error('Error getting approval fee info:', error);
    res.status(500).json({ error: "Failed to get approval fee information" });
  }
};

// Check if job seeker has existing Aadhaar documents
const checkExistingAadhaar = async (req, res) => {
  try {
    const auth0User = req.user;
    
    if (!auth0User?.email) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    // Get user from database
    const dbUser = await prisma.user.findFirst({ where: { email: auth0User.email } });
    if (!dbUser) {
      return res.status(404).json({ error: "User record not found" });
    }

    // Get jobSeeker profile
    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId: dbUser.id },
      select: {
        id: true,
        aadhaarDocumentUrl: true
      }
    });

    if (!jobSeeker) {
      return res.status(404).json({ error: "Job seeker profile not found" });
    }

    if (!jobSeeker.aadhaarDocumentUrl) {
      return res.json({ 
        hasAadhaar: false,
        message: "No Aadhaar documents found"
      });
    }

    // Parse existing Aadhaar data
    const aadhaarData = JSON.parse(jobSeeker.aadhaarDocumentUrl);

    res.json({
      hasAadhaar: true,
      aadhaarUrls: {
        front: aadhaarData.front,
        back: aadhaarData.back,
        uploadedAt: aadhaarData.uploadedAt
      }
    });

  } catch (error) {
    console.error('Error checking existing Aadhaar:', error);
    res.status(500).json({ error: "Failed to check Aadhaar documents" });
  }
};

// Get Aadhaar documents for a specific application (Company only)
const getAadhaarDocuments = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const auth0User = req.user;

    if (!auth0User?.email) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    // Check if user is company owner
    const user = await prisma.user.findFirst({
      where: { email: auth0User.email },
      include: { Company: true },
    });

    if (!user || !user.Company) {
      return res.status(403).json({ error: "Company profile not found" });
    }

    // Get application and verify it belongs to company's job
    const application = await prisma.jobApplication.findFirst({
      where: {
        id: applicationId,
        job: {
          companyId: user.Company.id
        }
      },
      include: {
        job: {
          select: {
            title: true,
            company: {
              select: {
                name: true
              }
            }
          }
        },
        jobSeeker: {
          select: {
            fullName: true,
            phone: true,
            location: true
          }
        }
      }
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found or not authorized" });
    }

    // Check if Aadhaar documents exist
    if (!application.aadhaarDocumentUrl) {
      return res.status(404).json({ 
        error: "Aadhaar documents not uploaded yet",
        status: application.status 
      });
    }

    // Parse Aadhaar document URLs
    const aadhaarData = JSON.parse(application.aadhaarDocumentUrl);

    res.json({
      application: {
        id: application.id,
        status: application.status,
        appliedAt: application.appliedAt,
        job: application.job,
        jobSeeker: application.jobSeeker
      },
      aadhaarDocuments: {
        front: aadhaarData.front,
        back: aadhaarData.back,
        uploadedAt: aadhaarData.uploadedAt
      }
    });

  } catch (error) {
    console.error('Error fetching Aadhaar documents:', error);
    res.status(500).json({ error: "Failed to fetch Aadhaar documents" });
  }
};

// Get all applications with Aadhaar status for company dashboard
const getApplicationsWithAadhaarStatus = async (req, res) => {
  try {
    const auth0User = req.user;

    if (!auth0User?.email) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    // Check if user is company owner
    const user = await prisma.user.findFirst({
      where: { email: auth0User.email },
      include: { Company: true },
    });

    if (!user || !user.Company) {
      return res.status(403).json({ error: "Company profile not found" });
    }

    // Get all hired applications for this company
    const applications = await prisma.jobApplication.findMany({
      where: {
        job: {
          companyId: user.Company.id
        },
        status: "HIRED"
      },
      include: {
        job: {
          select: {
            title: true,
            location: true
          }
        },
        jobSeeker: {
          select: {
            fullName: true,
            phone: true,
            location: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Add Aadhaar status and payment status to each application
    const applicationsWithAadhaarStatus = await Promise.all(applications.map(async (app) => {
      let aadhaarStatus = 'pending';
      let aadhaarUploadedAt = null;
      let paymentStatus = 'pending';

      // Check Aadhaar status
      if (app.aadhaarDocumentUrl) {
        try {
          const aadhaarData = JSON.parse(app.aadhaarDocumentUrl);
          aadhaarStatus = 'uploaded';
          aadhaarUploadedAt = aadhaarData.uploadedAt;
        } catch (e) {
          aadhaarStatus = 'error';
        }
      }

      // Check payment status
      const approvalPayment = await prisma.paymentTransaction.findFirst({
        where: {
          applicationId: app.id,
          paymentType: "APPROVAL_FEE",
          status: "SUCCESS"
        }
      });

      if (approvalPayment) {
        paymentStatus = 'paid';
      }

      return {
        id: app.id,
        status: app.status,
        appliedAt: app.appliedAt,
        updatedAt: app.updatedAt,
        job: app.job,
        jobSeeker: app.jobSeeker,
        aadhaarStatus,
        aadhaarUploadedAt,
        paymentStatus,
        approvalProcessComplete: aadhaarStatus === 'uploaded' && paymentStatus === 'paid'
      };
    }));

    res.json({
      applications: applicationsWithAadhaarStatus,
      summary: {
        total: applications.length,
        aadhaarUploaded: applicationsWithAadhaarStatus.filter(app => app.aadhaarStatus === 'uploaded').length,
        aadhaarPending: applicationsWithAadhaarStatus.filter(app => app.aadhaarStatus === 'pending').length,
        paymentCompleted: applicationsWithAadhaarStatus.filter(app => app.paymentStatus === 'paid').length,
        paymentPending: applicationsWithAadhaarStatus.filter(app => app.paymentStatus === 'pending').length,
        approvalProcessComplete: applicationsWithAadhaarStatus.filter(app => app.approvalProcessComplete).length
      }
    });

  } catch (error) {
    console.error('Error fetching applications with Aadhaar status:', error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  getCompanyApplications,
  withdrawApplication,
  uploadApplicationResume,
  checkApplicationResume,
  uploadAadhaarDocument,
  getApprovalFeeInfo,
  checkExistingAadhaar,
  getAadhaarDocuments,
  getApplicationsWithAadhaarStatus,
  upload // Export multer middleware
};
