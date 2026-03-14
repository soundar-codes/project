const router = require('express').Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({ $or: [{ owner: req.user._id }, { members: req.user._id }] })
      .populate('owner', 'name email').sort({ updatedAt: -1 });
    res.json({ projects });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const project = await Project.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ project });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');
    if (!project) return res.status(404).json({ message: 'Not found' });
    res.json({ project });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Not found or unauthorized' });
    res.json({ project });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ message: 'Not found or unauthorized' });
    res.json({ message: 'Project deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
