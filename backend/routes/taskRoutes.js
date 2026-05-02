const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// CREATE Task - POST /api/tasks
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, description, dueDate, assignedTo, projectId } = req.body;

        // Validate required fields
        if (!title || !dueDate || !assignedTo || !projectId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: title, dueDate, assignedTo, projectId'
            });
        }

        // Check if project exists and user is a member
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Check if user is a team member
        if (!project.teamMembers.includes(req.user.userId)) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this project'
            });
        }

        // Create task
        const task = new Task({
            title,
            description: description || '',
            dueDate,
            assignedTo,
            projectId,
            createdBy: req.user.userId,
            status: 'todo'
        });

        await task.save();

        // Populate assignedTo and createdBy details
        await task.populate('assignedTo', 'name email');
        await task.populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            task
        });

    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// GET ALL Tasks for a Project - GET /api/tasks/project/:projectId
router.get('/project/:projectId', authMiddleware, async (req, res) => {
    try {
        const { projectId } = req.params;

        // Check if user is a team member
        const project = await Project.findById(projectId);
        if (!project || !project.teamMembers.includes(req.user.userId)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to this project'
            });
        }

        const tasks = await Task.find({ projectId })
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .sort({ dueDate: 1 });

        res.status(200).json({
            success: true,
            count: tasks.length,
            tasks
        });

    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// UPDATE Task Status - PUT /api/tasks/:taskId/status
router.put('/:taskId/status', authMiddleware, async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;

        if (!['todo', 'in-progress', 'done'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be: todo, in-progress, or done'
            });
        }

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Check if user is assigned to the task OR is the project creator (admin)
        const project = await Project.findById(task.projectId);
        const isAdmin = project.createdBy.toString() === req.user.userId;
        const isAssigned = task.assignedTo.toString() === req.user.userId;

        if (!isAdmin && !isAssigned) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this task'
            });
        }

        task.status = status;
        await task.save();

        res.status(200).json({
            success: true,
            message: 'Task status updated',
            task
        });

    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// DELETE Task - DELETE /api/tasks/:taskId (Admin only)
router.delete('/:taskId', authMiddleware, async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Check if user is the project creator (admin)
        const project = await Project.findById(task.projectId);
        const isAdmin = project.createdBy.toString() === req.user.userId;

        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Only project admin can delete tasks'
            });
        }

        await task.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Task deleted successfully'
        });

    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;