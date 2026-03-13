const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const PASSWORD = process.env.APP_PASSWORD || 'brainlancer2026';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'ki-katapult-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session.authenticated) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Login page
app.get('/login', (req, res) => {
  if (req.session.authenticated) {
    return res.redirect('/');
  }

  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - Local Lead Engine</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lexend:wght@600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    h1, h2, h3 { font-family: 'Lexend', sans-serif; }
  </style>
</head>
<body class="bg-slate-900 min-h-screen flex items-center justify-center p-4">
  <div class="max-w-md w-full">
    <div class="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
      <div class="text-center mb-8">
        <div class="inline-block bg-green-500/10 rounded-full p-3 mb-4">
          <svg class="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-white mb-2">Local Lead Engine</h1>
        <p class="text-slate-400">Enter password to continue</p>
      </div>

      ${req.query.error ? '<div class="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4 text-red-400 text-sm text-center">Invalid password</div>' : ''}

      <form method="POST" action="/login" class="space-y-4">
        <div>
          <label for="password" class="block text-sm font-medium text-slate-300 mb-2">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            autofocus
            class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            placeholder="Enter password"
          />
        </div>

        <button
          type="submit"
          class="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Access Dashboard
        </button>
      </form>

      <div class="mt-8 pt-6 border-t border-slate-700 text-center">
        <p class="text-xs text-slate-500">Powered by <span class="text-green-500 font-semibold">KI Katapult</span></p>
      </div>
    </div>
  </div>

  <script>
    // Auto-focus password field
    document.getElementById('password').focus();
  </script>
</body>
</html>
  `);
});

// Login handler
app.post('/login', (req, res) => {
  const { password } = req.body;

  if (password === PASSWORD) {
    req.session.authenticated = true;
    res.redirect('/');
  } else {
    res.redirect('/login?error=1');
  }
});

// Logout handler
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Serve static files (protected)
app.use(express.static('public', {
  setHeaders: (res, path) => {
    if (!path.endsWith('.html')) return;
  }
}));

// Protected main app route
app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoints for demo data
app.post('/api/analyze-icp', requireAuth, (req, res) => {
  setTimeout(() => {
    res.json({
      company: req.body.company || 'Sample Company',
      profile: {
        industry: req.body.industry || 'Software',
        location: req.body.location || 'Berlin',
        type: req.body.type || 'B2B',
        idealCustomer: 'Mid-market B2B companies in DACH region',
        keyPainPoints: [
          'Manual lead generation processes',
          'Low conversion rates',
          'Limited market intelligence'
        ],
        targetCompanySize: '50-500 employees',
        decisionMakers: 'CMO, Head of Sales, Business Development'
      }
    });
  }, 3000);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Local Lead Engine running on http://localhost:${PORT}`);
  console.log(`🔐 Password: ${PASSWORD}`);
});
