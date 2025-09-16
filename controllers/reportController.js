const Report = require('../models/Report');
const User = require('../models/User');
const { createNotification } = require('../utils/notificationHelper');

/**
 * REPORT USER
 * Allows a logged-in user to report another user.
 */
exports.reportUser = async (req, res) => {
    try {
        const { reportedUserId, reason } = req.body;

        if (!reportedUserId || !reason) {
            return res.status(400).json({
                message: "Missing required fields",
                required: ["reportedUserId", "reason"],
                alert: "Please fill all required fields"
            });
        }

        if (reportedUserId === req.user.id) {
            return res.status(400).json({
                message: "Cannot report yourself",
                alert: "You cannot report yourself"
            });
        }

        const existingReport = await Report.findOne({
            reporter: req.user.id,
            reportedUser: reportedUserId,
            status: 'pending'
        });

        if (existingReport) {
            return res.status(400).json({
                message: "Already reported",
                alert: "You already have a pending report for this user"
            });
        }

        const report = new Report({ 
            reporter: req.user.id, 
            reportedUser: reportedUserId, 
            reason 
        });
        await report.save();

        const admins = await User.find({ userType: 'admin' });
        for (const admin of admins) {
            await createNotification({
                recipient: admin._id,
                type: 'user_reported',
                message: `New report against user ${reportedUserId}: ${reason}`
            });
        }

        // Populate reporter and reportedUser for response
        await report.populate('reporter', 'firstName lastName email')
                    .populate('reportedUser', 'firstName lastName email');

        res.status(201).json({
            message: "Report submitted successfully",
            report,
            alert: "Report submitted to administrators"
        });
    } catch (err) {
        res.status(500).json({ 
            message: "Error reporting user", 
            error: err.message,
            alert: "Failed to submit report"
        });
    }
};

/**
 * GET REPORTS
 * Admin can fetch all reports (optionally filter by status).
 */
exports.getReports = async (req, res) => {
    try {
        if (!req.user || req.user.userType !== 'admin') {
            return res.status(403).json({ message: "Admin access required" });
        }

        const { status } = req.query;
        const query = status ? { status } : {};

        const reports = await Report.find(query)
            .populate('reporter', 'firstName lastName email')
            .populate('reportedUser', 'firstName lastName email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            reports,
            alert: `Found ${reports.length} reports`
        });
    } catch (err) {
        res.status(500).json({ 
            message: "Error fetching reports", 
            error: err.message,
            alert: "Failed to load reports"
        });
    }
};

/**
 * UPDATE REPORT STATUS
 * Admin can mark a report as pending/resolved/dismissed.
 */
exports.updateReportStatus = async (req, res) => {
    try {
        const { status } = req.body;

        // Validate status
        if (!['pending', 'resolved', 'dismissed'].includes(status)) {
            return res.status(400).json({
                message: "Invalid status",
                alert: "Status must be one of: pending, resolved, dismissed"
            });
        }

        // Update report
        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        )
        .populate('reportedUser', 'firstName lastName email')
        .populate('reporter', 'firstName lastName email');

        if (!report) {
            return res.status(404).json({
                message: "Report not found",
                alert: "No report found with that ID"
            });
        }

        // Notify reporter if resolved
        if (status === 'resolved') {
            const reportedName = report.reportedUser 
                ? `${report.reportedUser.firstName} ${report.reportedUser.lastName}`
                : "the user";

            await createNotification({
                recipient: report.reporter._id,
                type: 'report_resolved',
                message: `Your report against ${reportedName} has been resolved`
            });
        }

        res.status(200).json({
            message: "Report status updated",
            report,
            alert: "Report status updated"
        });
    } catch (err) {
        res.status(500).json({
            message: "Error updating report",
            error: err.message,
            alert: "Failed to update report status"
        });
    }
};
