import express from 'express';
import { Skill } from '../models/index.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/skills
// @desc    Create skill (Admin)
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const skill = await Skill.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      skill,
    });
  } catch (error) {
    console.error('Create skill error:', error);
    res.status(500).json({ 
      error: 'Failed to create skill',
      details: error.message 
    });
  }
});

// @route   GET /api/skills
// @desc    Get all skills
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, isActive = true } = req.query;
    const filter = { isActive };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const skills = await Skill.find(filter).sort({ usageCount: -1, name: 1 });

    res.json({ success: true, skills, count: skills.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// @route   GET /api/skills/categories
// @desc    Get skill categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Skill.distinct('category');

    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// @route   PUT /api/skills/:id
// @desc    Update skill (Admin)
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    res.json({
      success: true,
      message: 'Skill updated successfully',
      skill,
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to update skill',
      details: error.message 
    });
  }
});

// @route   DELETE /api/skills/:id
// @desc    Delete skill (Admin)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    res.json({
      success: true,
      message: 'Skill deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete skill' });
  }
});

export default router;
