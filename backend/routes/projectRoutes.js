const express = require('express');
const Project = require('../models/Project');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// CREATE Project - POST /api/projects
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ 
                success: false, 
                message: 'Project name is required' 
            });
        }
        
        const project = new Project({
            name,
            description: description || '',
            createdBy: req.user.userId,
            teamMembers: [req.user.userId] // Creator is automatically a team member
        });
        
        await project.save();
        
        // Populate creator details
        await project.populate('createdBy', 'name email');
        
        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            project
        });
        
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
});

// GET All Projects for logged-in user - GET /api/projects
router.get('/', authMiddleware, async (req, res) => {
    try {
        const projects = await Project.find({
            teamMembers: req.user.userId
        }).populate('createdBy', 'name email')
          .populate('teamMembers', 'name email')
          .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: projects.length,
            projects
        });
        
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
});

// ADD Team Member to Project - POST /api/projects/:projectId/add-member
router.post('/:projectId/add-member', authMiddleware, async (req, res) => {
    try {
        const { email } = req.body;
        const { projectId } = req.params;
        
        // Find project
        const project = await Project.findById(projectId);
        
        if (!project) {
            return res.status(404).json({ 
                success: false, 
                message: 'Project not found' 
            });
        }
        
        // Check if user is the creator (Admin check)
        if (project.createdBy.toString() !== req.user.userId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Only project creator can add members' 
            });
        }
        
        // Find user by email
        const userToAdd = await User.findOne({ email });
        
        if (!userToAdd) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found with this email' 
            });
        }
        
        // Check if already a team member
        if (project.teamMembers.includes(userToAdd._id)) {
            return res.status(400).json({ 
                success: false, 
                message: 'User is already a team member' 
            });
        }
        
        // Add to team
        project.teamMembers.push(userToAdd._id);
        await project.save();
        
        res.status(200).json({
            success: true,
            message: 'Team member added successfully',
            project
        });
        
    } catch (error) {
        console.error('Add member error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error', 
            error: error.message 
        });
    }
});

module.exports = router;