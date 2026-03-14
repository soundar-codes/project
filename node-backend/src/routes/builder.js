const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const BuildJob = require('../models/BuildJob');

// Submit a new build job
router.post('/submit', auth, async (req, res) => {
  try {
    const { code, framework, platforms, projectId, appName } = req.body;
    
    // Create the job
    const job = new BuildJob({
      user: req.user.id,
      project: projectId || null,
      appName: appName || 'MyApp',
      code,
      framework,
      platforms,
      status: 'queued'
    });
    
    await job.save();

    // Start background "build" process (mocked for now)
    setTimeout(async () => {
        try {
            const j = await BuildJob.findById(job._id);
            if (!j) return;
            j.status = 'building';
            await j.save();
            
            setTimeout(async () => {
                const j2 = await BuildJob.findById(job._id);
                if(!j2) return;
                j2.status = 'success';
                j2.completedAt = new Date();
                
                // Mock code outputs for different platforms
                let webCode = `/* Web version of ${appName} */\n${code}`;
                let androidCode = `// Android Kotlin version of ${appName}\n${code.replace(/function/g, 'fun').replace(/return \(/g, 'return ').replace(/<[^>]+>/g, '')}`;
                let iosCode = `// iOS Swift version of ${appName}\n${code.replace(/function/g, 'func').replace(/return \(/g, 'return ').replace(/<[^>]+>/g, '')}`;

                // Set outputs based on selected platforms
                if (platforms.includes('web')) j2.outputs.web = webCode;
                if (platforms.includes('android')) j2.outputs.android = androidCode;
                if (platforms.includes('ios')) j2.outputs.ios = iosCode;

                await j2.save();
            }, 3000); // Simulate build time
        } catch (e) {
            console.error('Build background error', e);
        }
    }, 1000);
    
    res.json({ job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's jobs
router.get('/jobs', auth, async (req, res) => {
  try {
    const jobs = await BuildJob.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific job
router.get('/jobs/:id', auth, async (req, res) => {
  try {
    const job = await BuildJob.findOne({ _id: req.params.id, user: req.user.id });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ job });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Preview a built app
router.get('/preview/:id', async (req, res) => {
    try {
        const job = await BuildJob.findById(req.params.id);
        if (!job || job.status !== 'success' || !job.platforms.includes('web')) {
            return res.status(404).send('Preview not available');
        }

        // Extremely simple HTML preview for React-like code
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${job.appName} Preview</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; 
                    padding: 20px;
                    color: white; /* Trying to keep cyber theme vibes in preview */
                    background: transparent;
                }
                .preview-container {
                    padding: 20px;
                    border: 1px dashed rgba(255,255,255,0.2);
                    border-radius: 8px;
                }
            </style>
            <!-- Adding Babel/React for simple previews if it was react -->
            <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
            <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        </head>
        <body>
            <div id="root"></div>
            <script type="text/babel">
                // Wrap code in an IIFE to extract the default component
                try {
                    ${job.code}
                    
                    // Simple hack to find the main component
                    const components = Object.keys(window).filter(k => k[0] === k[0].toUpperCase() && typeof window[k] === 'function');
                    
                    // Try to render the first function that looks like a component, or just a generic message
                    const root = ReactDOM.createRoot(document.getElementById('root'));
                    
                    // The eval hack is a bit dirty, but works for simple previews
                    let CompToRender = null;
                    if (typeof MyApp !== 'undefined') CompToRender = MyApp;
                    else if (typeof App !== 'undefined') CompToRender = App;
                    else if (typeof LoginForm !== 'undefined') CompToRender = LoginForm;
                    else if (typeof ProductCard !== 'undefined') CompToRender = ProductCard;
                    else if (typeof ChatUI !== 'undefined') CompToRender = ChatUI;
                    
                    if (CompToRender) {
                        root.render(<CompToRender />);
                    } else {
                        root.render(
                            <div className="preview-container">
                                <h3>App Compiled Successfully</h3>
                                <p>App logic is running, but no primary component was found to render.</p>
                                <pre style={{fontSize: 10, opacity: 0.5}}>{JSON.stringify(Object.keys(window).filter(k=>!k.match(/^[a-z_]/)), null, 2)}</pre>
                            </div>
                        );
                    }
                } catch (e) {
                    document.getElementById('root').innerHTML = '<div style="color:red">Error: ' + e.message + '</div>';
                }
            </script>
        </body>
        </html>
        `;
        res.send(html);
    } catch (err) {
        res.status(500).send('Error loading preview');
    }
});

module.exports = router;
