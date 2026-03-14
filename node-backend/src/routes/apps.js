const router = require('express').Router();
const App = require('../models/App');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const apps = await App.find({ owner: req.user._id }).populate('project', 'name').sort({ createdAt: -1 });
    res.json({ apps });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const app = await App.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ app });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/build', async (req, res) => {
  try {
    const app = await App.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { status: 'building', updatedAt: Date.now() },
      { new: true }
    );
    if (!app) return res.status(404).json({ message: 'Not found' });
    setTimeout(async () => {
      await App.findByIdAndUpdate(app._id, { status: 'live', buildUrl: `http://localhost:5000/preview/${app._id}` });
    }, 5000);
    res.json({ app, message: 'Build started' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const app = await App.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!app) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'App deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
