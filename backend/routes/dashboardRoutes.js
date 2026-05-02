const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// DASHBOARD - GET /api/dashboard
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get all projects where user is a member
        const projects = await Project.find({ teamMembers: userId });
        const projectIds = projects.map(p => p._id);

        // Get all tasks assigned to this user
        const allTasks = await Task.find({ 
            assignedTo: userId 
        }).populate('projectId', 'name');

        // Calculate statistics
        const totalTasks = allTasks.length;
        const todoTasks = allTasks.filter(t => t.status === 'todo').length;
        const inProgressTasks = allTasks.filter(t => t.status === 'in-progress').length;
        const doneTasks = allTasks.filter(t => t.status === 'done').length;

        // Find overdue tasks (dueDate < today and status not 'done')
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const overdueTasks = allTasks.filter(t => {
            const dueDate = new Date(t.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate < today && t.status !== 'done';
        });

        // Get recent tasks (last 7 days, ordered by most recent)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentTasks = allTasks
            .filter(t => new Date(t.createdAt) >= sevenDaysAgo)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        res.status(200).json({
            success: true,
            dashboard: {
                stats: {
                    totalProjects: projects.length,
                    totalTasks,
                    todoTasks,
                    inProgressTasks,
                    doneTasks
                },
                overdueTasks: {
                    count: overdueTasks.length,
                    tasks: overdueTasks.map(t => ({
                        id: t._id,
                        title: t.title,
                        dueDate: t.dueDate,
                        status: t.status,
                        projectName: t.projectId?.name || 'Unknown'
                    }))
                },
                recentTasks: recentTasks.map(t => ({
                    id: t._id,
                    title: t.title,
                    status: t.status,
                    dueDate: t.dueDate,
                    projectName: t.projectId?.name || 'Unknown'
                })),
                tasksByStatus: {
                    todo: todoTasks,
                    inProgress: inProgressTasks,
                    done: doneTasks
                }
            }
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;