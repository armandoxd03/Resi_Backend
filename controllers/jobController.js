const mongoose = require('mongoose');
const Job = require('../models/Job');
const User = require('../models/User');
const { findMatchingJobs } = require('../utils/matchingEngine');
const { createNotification } = require('../utils/notificationHelper');
const { sendSMS } = require('../utils/smsService');

//  POST /api/jobs → Post a new job
exports.postJob = async (req, res) => {
    try {
        if (!req.body.title || !req.body.price || !req.body.barangay) {
            return res.status(400).json({
                message: "Missing required fields",
                required: ["title", "price", "barangay"],
                alert: "Please fill all required fields"
            });
        }

        const job = new Job({ 
            ...req.body, 
            postedBy: req.user.id,
            status: 'open'
        });

        await job.save();

        const matchingUsers = await User.find({
            barangay: job.barangay,
            skills: { $in: job.skillsRequired },
            userType: { $in: ['employee', 'both'] }
        });

        matchingUsers.forEach(async user => {
            await createNotification({
                recipient: user._id,
                type: 'job_match',
                message: `New job in your area matching your skills: ${job.title}`,
                relatedJob: job._id
            });

            if (user.notificationPreferences?.sms) {
                await sendSMS(
                    user._id,
                    `New job in ${job.barangay}: ${job.title}. Pay: ₱${job.price}`
                );
            }
        });

        res.status(201).json({
            message: "Job posted successfully",
            job,
            matchesFound: matchingUsers.length,
            alert: "Job posted! Potential candidates will be notified"
        });
    } catch (err) {
        res.status(500).json({ 
            message: "Error posting job", 
            error: err.message,
            alert: "Failed to post job. Please try again."
        });
    }
};

//  GET /api/jobs → Get all open jobs
exports.getAll = async (req, res) => {
    try {
        console.log('getAll jobs - Query params:', req.query);
        
        const { 
            sortBy = 'datePosted', 
            order = 'desc',
            limit,
            startDate,
            endDate,
            status
        } = req.query;

        console.log('Parsed params - sortBy:', sortBy, 'order:', order, 'limit:', limit);

        // Build query
        let query = { isOpen: true };
        
        // Add date filtering if provided
        if (startDate || endDate) {
            query.datePosted = {};
            if (startDate) query.datePosted.$gte = new Date(startDate);
            if (endDate) query.datePosted.$lte = new Date(endDate);
        }

        // Add status filtering if provided
        if (status && status !== 'all') {
            query.status = status;
        }

        // Build sort object
        const sortObj = {};
        const sortOrder = order === 'asc' ? 1 : -1;
        
        // Handle different sort fields
        switch (sortBy) {
            case 'datePosted':
                sortObj.datePosted = sortOrder;
                break;
            case 'price':
                sortObj.price = sortOrder;
                break;
            case 'applicants':
                // For applicants count, we'll need to use aggregation
                const pipeline = [
                    { $match: query },
                    {
                        $addFields: {
                            applicantCount: { $size: "$applicants" }
                        }
                    },
                    { $sort: { applicantCount: sortOrder } },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'postedBy',
                            foreignField: '_id',
                            as: 'postedBy',
                            pipeline: [{ $project: { firstName: 1, lastName: 1, profilePicture: 1 } }]
                        }
                    },
                    { $unwind: '$postedBy' }
                ];
                
                if (limit) pipeline.push({ $limit: parseInt(limit) });
                
                const aggregatedJobs = await Job.aggregate(pipeline);
                return res.status(200).json({
                    jobs: aggregatedJobs,
                    alert: `Found ${aggregatedJobs.length} open jobs`
                });
                
            default:
                sortObj.datePosted = -1; // Default to newest first
        }

        let jobQuery = Job.find(query)
            .populate('postedBy', 'firstName lastName profilePicture')
            .sort(sortObj);

        if (limit) {
            jobQuery = jobQuery.limit(parseInt(limit));
        }

        const jobs = await jobQuery;

        res.status(200).json({
            jobs,
            alert: `Found ${jobs.length} open jobs`
        });
    } catch (err) {
        console.error('Error in getAll jobs:', err);
        res.status(500).json({ 
            message: "Error fetching jobs", 
            error: err.message,
            alert: "Failed to load jobs"
        });
    }
};

//  GET /api/jobs/:id → Get a specific job by ID
exports.getJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('postedBy', 'firstName lastName profilePicture email')
            .populate('applicants.user', 'firstName lastName profilePicture email')
            .populate('assignedTo', 'firstName lastName profilePicture email');

        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                alert: "The requested job does not exist"
            });
        }

        res.status(200).json(job);
    } catch (err) {
        res.status(500).json({ 
            message: "Error fetching job", 
            error: err.message,
            alert: "Failed to load job details"
        });
    }
};

// GET /api/jobs/my-matches → Get jobs matching logged-in user
exports.getMyMatches = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                alert: "Your account information could not be found"
            });
        }
        
        console.log(`Finding job matches for user ${user._id} (${user.firstName} ${user.lastName})`);
        console.log(`User skills: ${user.skills?.join(', ') || 'None'}`);
        
        if (!user.skills || user.skills.length === 0) {
            return res.status(200).json({
                jobs: [],
                alert: "Update your profile with skills to see job matches",
                noSkills: true
            });
        }
        
        const matchingJobs = await findMatchingJobs(user);
        
        console.log(`Returning ${matchingJobs.length} job matches to user`);

        res.status(200).json({
            jobs: matchingJobs,
            alert: matchingJobs.length > 0 
                ? `Found ${matchingJobs.length} jobs matching your skills` 
                : "No matching jobs found. Try updating your skills or checking back later."
        });
    } catch (err) {
        console.error("Error in getMyMatches:", err);
        res.status(500).json({ 
            message: "Error fetching matches", 
            error: err.message,
            alert: "Failed to find matching jobs"
        });
    }
};

// POST /api/jobs/:id/apply → Apply for a job
exports.applyJob = async (req, res) => {
    try {
        // Check if user has permission to apply to jobs
        const applicant = await User.findById(req.user.id);
        if (!applicant) {
            return res.status(404).json({ 
                message: "User not found",
                alert: "Your account could not be found"
            });
        }

        // Only employees can apply to jobs
        if (applicant.userType === 'employer') {
            return res.status(403).json({ 
                message: "Employers cannot apply to jobs",
                alert: "Employers cannot apply to jobs. Use your employer dashboard to find workers instead."
            });
        }

        if (applicant.userType !== 'employee' && applicant.userType !== 'both') {
            return res.status(403).json({ 
                message: "Employee profile required",
                alert: "You need an employee profile to apply to jobs"
            });
        }

        const job = await Job.findById(req.params.id).populate('postedBy');
        if (!job) {
            return res.status(404).json({ 
                message: "Job not found",
                alert: "This job is no longer available"
            });
        }

        // Prevent users from applying to their own jobs
        if (job.postedBy._id.toString() === req.user.id) {
            return res.status(400).json({ 
                message: "Cannot apply to own job",
                alert: "You cannot apply to your own job posting"
            });
        }

        if (!job.isOpen) {
            return res.status(400).json({ 
                message: "Job is closed",
                alert: "This job is no longer accepting applications"
            });
        }

        const alreadyApplied = job.applicants.some(a => a.user.toString() === req.user.id);
        if (alreadyApplied) {
            return res.status(400).json({ 
                message: "Already applied",
                alert: "You've already applied to this job"
            });
        }

        job.applicants.push({ 
            user: req.user.id,
            appliedAt: new Date()
        });
        await job.save();

        await createNotification({
            recipient: job.postedBy._id,
            type: 'job_applied',
            message: `${applicant.firstName} ${applicant.lastName} applied to your job "${job.title}"`,
            relatedJob: job._id
        });

        await createNotification({
            recipient: req.user.id,
            type: 'application_sent',
            message: `You applied to "${job.title}"`,
            relatedJob: job._id
        });

        res.status(200).json({ 
            message: "Application submitted",
            jobId: job._id,
            jobTitle: job.title,
            employer: job.postedBy.firstName + ' ' + job.postedBy.lastName,
            alert: "Application sent successfully!"
        });
    } catch (err) {
        res.status(500).json({ 
            message: "Error applying", 
            error: err.message,
            alert: "Failed to apply. Please try again."
        });
    }
};

// DELETE /api/jobs/:id/cancel-application → Cancel job application
exports.cancelApplication = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
                message: "Unauthorized: no user info",
                alert: "Please log in again to cancel your application"
            });
        }

        const job = await Job.findById(req.params.id).populate('postedBy');
        if (!job) {
            return res.status(404).json({ 
                message: "Job not found",
                alert: "This job is no longer available"
            });
        }

        // Debug information
        console.log(`Looking for application for user ID: ${req.user.id}`);
        console.log(`Job applicants:`, job.applicants.map(a => ({
            userId: a.user ? a.user.toString() : 'undefined',
            status: a.status
        })));
        
        // First try direct string comparison
        const applicationIndex = job.applicants.findIndex(a => 
            a.user && (a.user.toString() === req.user.id || a.user === req.user.id)
        );
        
        if (applicationIndex === -1) {
            console.log(`No application found for user ${req.user.id} on job ${req.params.id}`);
            return res.status(400).json({ 
                message: "No application found",
                error: "CANCEL_APPLICATION_NOT_FOUND",
                applicants: job.applicants.map(a => ({
                    userId: a.user ? a.user.toString() : 'undefined',
                    status: a.status
                })),
                alert: "You haven't applied to this job"
            });
        }

        // Check if application is already accepted or rejected
        const application = job.applicants[applicationIndex];
        if (application.status === 'accepted') {
            return res.status(400).json({ 
                message: "Cannot cancel accepted application",
                alert: "Your application has already been accepted and cannot be cancelled"
            });
        }

        // Remove the application
        job.applicants.splice(applicationIndex, 1);
        await job.save();

        const applicant = await User.findById(req.user.id);
        
        // Send notifications (don't let notification failures affect the main operation)
        try {
            if (applicant) {
                // Notify employer
                await createNotification({
                    recipient: job.postedBy._id,
                    type: 'application_cancelled',
                    message: `${applicant.firstName} ${applicant.lastName} cancelled their application for "${job.title}"`,
                    relatedJob: job._id
                });

                // Notify applicant
                await createNotification({
                    recipient: req.user.id,
                    type: 'application_cancelled',
                    message: `You cancelled your application for "${job.title}"`,
                    relatedJob: job._id
                });
            }
        } catch (notificationError) {
            console.error('Error sending cancel notifications:', notificationError);
            // Continue execution - don't fail the main operation due to notification issues
        }

        res.status(200).json({ 
            message: "Application cancelled successfully",
            jobId: job._id,
            jobTitle: job.title,
            alert: "Application cancelled successfully!"
        });
    } catch (err) {
        console.error('Cancel application error:', err);
        res.status(500).json({ 
            message: "Error cancelling application", 
            error: err.message,
            alert: "Failed to cancel application. Please try again."
        });
    }
};

// POST /api/jobs/:id/assign → Assign worker to a job
exports.assignWorker = async (req, res) => {
    try {
        console.log('assignWorker called for job:', req.params.id);
        console.log('Request body:', req.body);
        
        const job = await Job.findById(req.params.id).populate('postedBy');
        if (!job) {
            console.log('Job not found:', req.params.id);
            return res.status(404).json({ 
                message: "Job not found",
                alert: "This job is no longer available"
            });
        }

        // ✅ Fix postedBy comparison - ensure both are strings
        const jobPostedById = job.postedBy._id.toString();
        const currentUserId = req.user.id.toString();
        
        if (jobPostedById !== currentUserId) {
            console.log('Authorization failed:', {
                jobPostedBy: jobPostedById,
                requestUserId: currentUserId
            });
            return res.status(403).json({ 
                message: "Not authorized",
                alert: "You can only assign workers to your own jobs"
            });
        }

        // ✅ Ensure userId was provided
        const { userId } = req.body;
        console.log('Requested userId to assign:', userId);
        if (!userId) {
            console.log('Missing userId in request body');
            return res.status(400).json({
                message: "Missing userId",
                alert: "You must provide the applicant's userId"
            });
        }

        // ✅ Check applicant
        const isApplicant = job.applicants.some(a => a.user.toString() === userId);
        if (!isApplicant) {
            return res.status(400).json({ 
                message: "User didn't apply",
                alert: "You can only assign workers who applied to this job"
            });
        }

        job.assignedTo = userId;
        job.isOpen = false;
        job.status = 'assigned';

        job.applicants = job.applicants.map(a => ({
            ...a.toObject(),
            status: a.user.toString() === userId ? 'accepted' : 'rejected'
        }));

        await job.save();

        const worker = await User.findById(userId);

        await createNotification({
            recipient: userId,
            type: 'job_accepted',
            message: `You've been assigned to "${job.title}"`,
            relatedJob: job._id
        });

        if (worker.notificationPreferences?.sms) {
            await sendSMS(
                userId,
                `You got the job: ${job.title}. Contact ${job.postedBy.firstName} at ${job.postedBy.mobileNo}`
            );
        }

        res.status(200).json({ 
            message: "Worker assigned successfully",
            job: {
                id: job._id,
                title: job.title,
                assignedTo: worker.firstName + ' ' + worker.lastName
            },
            alert: "Worker assigned and notified"
        });
    } catch (err) {
        res.status(500).json({ 
            message: "Error assigning worker", 
            error: err.message,
            alert: "Failed to assign worker"
        });
    }
};


// GET /api/jobs/search → Search jobs with filters
exports.search = async (req, res) => {
    try {
        const { skill, barangay, minPrice, maxPrice, sortBy = 'datePosted', order = 'desc', page = 1, limit = 10 } = req.query;
        
        let query = { isOpen: true };
        
        if (skill) query.skillsRequired = { $in: skill.split(',') };
        if (barangay) query.barangay = barangay;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const sortOptions = {};
        sortOptions[sortBy] = order === 'asc' ? 1 : -1;

        const [jobs, total] = await Promise.all([
            Job.find(query)
                .sort(sortOptions)
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('postedBy', 'firstName lastName'),
            Job.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            data: jobs,
            filters: {
                skill,
                barangay,
                priceRange: { minPrice, maxPrice }
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            },
            sortedBy: `${sortBy} (${order})`,
            alert: jobs.length ? `Found ${total} jobs` : "No jobs found matching your criteria"
        });
    } catch (err) {
        res.status(500).json({ 
            message: "Error searching jobs", 
            error: err.message,
            alert: "Job search failed"
        });
    }
};

exports.getPopularJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ isOpen: true })
      .populate('postedBy', 'firstName lastName')
      .sort({ applicants: -1, datePosted: -1 })
      .limit(10);
    
    res.status(200).json({
      success: true,
      jobs
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching popular jobs",
      error: err.message
    });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    // First fetch all jobs where the user has applied
    const allApplicationJobs = await Job.find({
      'applicants.user': req.user.id
    })
    .populate('postedBy', 'firstName lastName')
    .sort({ datePosted: -1 });
    
    // Filter the jobs into active applications and history
    const activeApplications = [];
    const applicationHistory = [];
    
    allApplicationJobs.forEach(job => {
      const userApplication = job.applicants.find(a => 
        a.user && a.user.toString() === req.user.id
      );
      
      // Determine if this is an active application or part of history
      const isActive = job.isOpen && userApplication && userApplication.status === 'pending';
      
      // Add the job to the appropriate list
      if (isActive) {
        activeApplications.push(job);
      } else {
        // Include the application status in the history items
        const statusInfo = {
          status: userApplication ? userApplication.status : 'unknown',
          isOpen: job.isOpen,
          assignedToMe: job.assignedTo && job.assignedTo.toString() === req.user.id
        };
        applicationHistory.push({ ...job.toObject(), applicationInfo: statusInfo });
      }
    });
    
    res.status(200).json({
      activeApplications,
      applicationHistory,
      // For backward compatibility, return the active applications as the main array
      // This will be used by existing code that expects a simple array
      ...activeApplications
    });
  } catch (err) {
    console.error('Error in getMyApplications:', err);
    res.status(500).json({
      message: "Error fetching user applications",
      error: err.message
    });
  }
};

// GET /api/jobs/my-jobs → Get jobs posted by current user
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id })
      .populate('postedBy', 'firstName lastName')
      .populate('applicants.user', 'firstName lastName email mobileNo')
      .populate('assignedTo', 'firstName lastName')
      .sort({ datePosted: -1 });
    
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching your jobs",
      error: err.message
    });
  }
};

// GET /api/jobs/my-applications-received → Get applications for user's jobs
exports.getMyApplicationsReceived = async (req, res) => {
  try {
    const jobs = await Job.find({ 
      postedBy: req.user.id,
      'applicants.0': { $exists: true } // Only jobs with applicants
    })
    .populate('applicants.user', 'firstName lastName email mobileNo skills')
    .sort({ datePosted: -1 });
    
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching applications",
      error: err.message
    });
  }
};

// PUT /api/jobs/:id/close → Close a job
exports.closeJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ 
        message: "Job not found",
        alert: "This job is no longer available"
      });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: "Not authorized",
        alert: "You can only close your own jobs"
      });
    }

    job.isOpen = false;
    job.status = 'closed';
    await job.save();

    res.status(200).json({ 
      message: "Job closed successfully",
      job,
      alert: "Job has been closed"
    });
  } catch (err) {
    res.status(500).json({ 
      message: "Error closing job", 
      error: err.message,
      alert: "Failed to close job"
    });
  }
};

// DELETE /api/jobs/:id → Delete a job
exports.deleteJob = async (req, res) => {
    try {
        console.log('deleteJob called for job ID:', req.params.id);
        console.log('User ID attempting deletion:', req.user.id);
        
        const job = await Job.findById(req.params.id);
        if (!job) {
            console.log('Job not found for deletion - already deleted');
            // Instead of error, return success (idempotent delete)
            return res.status(200).json({
                message: "Job already deleted",
                alert: "Job has been deleted"
            });
        }

        console.log('Job found:', {
            jobId: job._id,
            postedBy: job.postedBy ? job.postedBy.toString() : 'undefined',
            postedByType: job.postedBy ? typeof job.postedBy : 'undefined',
            postedByIsObjectId: job.postedBy ? job.postedBy instanceof mongoose.Types.ObjectId : false,
            title: job.title
        });

        console.log('User attempting deletion:', {
            userId: req.user.id,
            userIdType: typeof req.user.id,
            userType: req.user.userType
        });

        // Get the string representations for safe comparison
        const jobOwnerId = job.postedBy ? job.postedBy.toString() : '';
        const currentUserId = req.user.id ? req.user.id.toString() : '';
        
        console.log('ID comparison:', {
            jobOwnerId,
            currentUserId,
            isMatch: jobOwnerId === currentUserId,
            isAdmin: req.user.userType === 'admin'
        });

        // Check if the job is owned by the user trying to delete it or if user is admin
        if (job.postedBy && jobOwnerId !== currentUserId && req.user.userType !== 'admin') {
            console.log('Authorization failed for job deletion:', {
                jobPostedBy: jobOwnerId,
                requestUserId: currentUserId,
                userType: req.user.userType
            });
            return res.status(403).json({ 
                message: "Not authorized",
                alert: "You can only delete your own jobs"
            });
        }

        await Job.findByIdAndDelete(req.params.id);
        console.log('Job successfully deleted:', req.params.id);

        res.status(200).json({ 
            message: "Job deleted successfully",
            alert: "Job has been deleted"
        });
    } catch (err) {
        console.error('Error in deleteJob:', err);
        
        // Provide a more helpful error message
        let errorMessage = "Failed to delete job";
        if (err.name === 'CastError' && err.kind === 'ObjectId') {
            errorMessage = "Invalid job ID format";
        } else if (err.message.includes('not authorized')) {
            errorMessage = "Not authorized to delete this job";
        }
        
        res.status(500).json({ 
            message: "Error deleting job", 
            error: err.message,
            alert: errorMessage
        });
    }
};

// POST /api/jobs/:id/reject → Reject an application
exports.rejectApplication = async (req, res) => {
  try {
    console.log('rejectApplication called for job:', req.params.id);
    console.log('Request body:', req.body);
    
    const job = await Job.findById(req.params.id).populate('postedBy');
    if (!job) {
      console.log('Job not found:', req.params.id);
      return res.status(404).json({ 
        message: "Job not found",
        alert: "This job is no longer available"
      });
    }

    // Ensure consistent string comparison
    const jobPostedById = job.postedBy._id.toString();
    const currentUserId = req.user.id.toString();
    
    if (jobPostedById !== currentUserId) {
      console.log('Authorization failed:', {
        jobPostedBy: jobPostedById,
        requestUserId: currentUserId,
        match: jobPostedById === currentUserId
      });
      return res.status(403).json({ 
        message: "Not authorized",
        alert: "You can only manage applications for your own jobs"
      });
    }

    const { userId } = req.body;
    console.log('Requested userId to reject:', userId);
    if (!userId) {
      console.log('Missing userId in request body');
      return res.status(400).json({
        message: "Missing userId",
        alert: "You must provide the applicant's userId"
      });
    }

    const applicationIndex = job.applicants.findIndex(a => a.user.toString() === userId);
    if (applicationIndex === -1) {
      return res.status(400).json({ 
        message: "Application not found",
        alert: "This user hasn't applied to this job"
      });
    }

    job.applicants[applicationIndex].status = 'rejected';
    await job.save();

    const worker = await User.findById(userId);
    await createNotification({
      recipient: userId,
      type: 'application_rejected',
      message: `Your application for "${job.title}" was not selected`,
      relatedJob: job._id
    });

    res.status(200).json({ 
      message: "Application rejected successfully",
      job: {
        id: job._id,
        title: job.title,
        rejectedApplicant: worker ? `${worker.firstName} ${worker.lastName}` : 'Unknown'
      },
      alert: "Application rejected and applicant notified"
    });
  } catch (err) {
    res.status(500).json({ 
      message: "Error rejecting application", 
      error: err.message,
      alert: "Failed to reject application"
    });
  }
};

// PUT /api/jobs/:jobId/applicants/:userId → Update applicant status (for admin use)
exports.updateApplicantStatus = async (req, res) => {
    try {
        const { jobId, userId } = req.params;
        const { status } = req.body;

        if (!['pending', 'accepted', 'rejected'].includes(status)) {
            return res.status(400).json({
                message: "Invalid status",
                alert: "Status must be pending, accepted, or rejected"
            });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                alert: "This job is no longer available"
            });
        }

        // Allow admin or job poster to update applicant status
        if (job.postedBy.toString() !== req.user.id && req.user.userType !== 'admin') {
            return res.status(403).json({
                message: "Not authorized",
                alert: "You can only manage applicants for your own jobs"
            });
        }

        // Find and update the applicant
        const applicantIndex = job.applicants.findIndex(a => a.user.toString() === userId);
        if (applicantIndex === -1) {
            return res.status(404).json({
                message: "Applicant not found",
                alert: "This user did not apply to this job"
            });
        }

        job.applicants[applicantIndex].status = status;

        // If accepting, assign the job and reject others
        if (status === 'accepted') {
            job.assignedTo = userId;
            job.isOpen = false;
            job.status = 'assigned';
            
            // Reject all other applicants
            job.applicants = job.applicants.map(a => ({
                ...a.toObject(),
                status: a.user.toString() === userId ? 'accepted' : 'rejected'
            }));
        }

        await job.save();

        // Create notification for the applicant
        await createNotification({
            recipient: userId,
            type: 'application_update',
            message: `Your application for "${job.title}" has been ${status}`,
            relatedJob: job._id
        });

        res.status(200).json({
            success: true,
            message: `Applicant ${status} successfully`,
            job,
            alert: `Application ${status} successfully`
        });
    } catch (err) {
        console.error('Error updating applicant status:', err);
        res.status(500).json({
            success: false,
            message: "Error updating applicant status",
            error: err.message,
            alert: "Failed to update applicant status"
        });
    }
};

// PUT /api/jobs/:jobId/applicants/:userId → Update applicant status (for admin use)
exports.updateApplicantStatus = async (req, res) => {
    try {
        const { jobId, userId } = req.params;
        const { status } = req.body;

        if (!['pending', 'accepted', 'rejected'].includes(status)) {
            return res.status(400).json({
                message: "Invalid status",
                alert: "Status must be pending, accepted, or rejected"
            });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                alert: "This job is no longer available"
            });
        }

        // Allow admin or job poster to update applicant status
        if (job.postedBy.toString() !== req.user.id && req.user.userType !== 'admin') {
            return res.status(403).json({
                message: "Not authorized",
                alert: "You can only manage applicants for your own jobs"
            });
        }

        // Find and update the applicant
        const applicantIndex = job.applicants.findIndex(a => a.user.toString() === userId);
        if (applicantIndex === -1) {
            return res.status(404).json({
                message: "Applicant not found",
                alert: "This user did not apply to this job"
            });
        }

        job.applicants[applicantIndex].status = status;

        // If accepting, assign the job and reject others
        if (status === 'accepted') {
            job.assignedTo = userId;
            job.isOpen = false;
            job.status = 'assigned';
            
            // Reject all other applicants
            job.applicants = job.applicants.map(a => ({
                ...a.toObject(),
                status: a.user.toString() === userId ? 'accepted' : 'rejected'
            }));
        }

        await job.save();

        // Create notification for the applicant
        await createNotification({
            recipient: userId,
            type: 'application_update',
            message: `Your application for "${job.title}" has been ${status}`,
            relatedJob: job._id
        });

        res.status(200).json({
            success: true,
            message: `Applicant ${status} successfully`,
            job,
            alert: `Application ${status} successfully`
        });
    } catch (err) {
        console.error('Error updating applicant status:', err);
        res.status(500).json({
            success: false,
            message: "Error updating applicant status",
            error: err.message,
            alert: "Failed to update applicant status"
        });
    }
};
