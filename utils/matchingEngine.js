const Job = require('../models/Job');

/**
 * Find jobs matching a user's skills and barangay.
 * @param {User} user - Mongoose User document
 * @param {number} [limit=10]
 * @returns {Promise<Array>} Array of Job documents
 */
exports.findMatchingJobs = async (user, limit = 10) => {
    // Find jobs based on skill overlap & barangay proximity
    const jobs = await Job.find({
        isOpen: true,
        barangay: user.barangay,
        skillsRequired: { $in: user.skills }
    });
    // Score by number of matching skills
    const scored = jobs.map(job => ({
        job,
        score: job.skillsRequired.filter(skill => user.skills.includes(skill)).length
    }));
    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(s => s.job);
};