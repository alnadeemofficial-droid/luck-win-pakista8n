import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Proxy requests to Google Apps Script
// IMPORTANT: PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL BELOW
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbygTqF2SthTtFhZ62zOFEj7gU_Q_bWLhBHOGZ3ZSO6FXNDerozd6Mr38vg1j9ReDEA9/exec";
// const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL ? process.env.GOOGLE_SCRIPT_URL.trim() : "";

if (!GOOGLE_SCRIPT_URL) {
  console.error("CRITICAL ERROR: GOOGLE_SCRIPT_URL is not defined.");
} else {
  console.log("GOOGLE_SCRIPT_URL is set (Hardcoded for testing):", GOOGLE_SCRIPT_URL.substring(0, 10) + "...");
}

async function callAppsScript(action: string, payload: any = {}) {
  if (!GOOGLE_SCRIPT_URL) {
    console.error("Attempted to call Apps Script without GOOGLE_SCRIPT_URL set.");
    return { status: 'error', message: 'Server Configuration Error: GOOGLE_SCRIPT_URL is missing in environment variables.' };
  }

  try {
    console.log(`Calling Apps Script: ${action}`);
    
    // Prepare form data
    const params = new URLSearchParams();
    params.append('action', action);
    
    // Add payload to params
    if (payload) {
        // If payload is a simple object, append keys. 
        // If it has nested objects (like 'tiers' array), we might need to stringify them 
        // or send the whole payload as a single JSON string if the GAS expects that.
        // The previous GAS code expected 'data' object or individual params.
        // Let's send individual params for top-level, and stringify complex ones.
        
        for (const key in payload) {
            const value = payload[key];
            if (typeof value === 'object' && value !== null) {
                params.append(key, JSON.stringify(value));
            } else if (value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        }
    }

    // Send POST request
    // GAS often redirects (302). Axios follows by default.
    // We use form-urlencoded because it's handled better by GAS doPost(e) -> e.parameter
    const response = await axios.post(GOOGLE_SCRIPT_URL, params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        maxRedirects: 5,
        timeout: 30000 // 30 seconds timeout
    });
    
    const data = response.data;
    console.log(`Apps Script Response (${action}):`, typeof data === 'object' ? JSON.stringify(data).substring(0, 200) + '...' : String(data).substring(0, 200));

    if (typeof data === 'string') {
        // Try to parse if it's a string
        try {
            return JSON.parse(data);
        } catch (e) {
             console.warn(`Apps Script returned string but not JSON for action: ${action}`);
             if (data.trim().startsWith('<')) {
                 return { status: 'error', message: 'Apps Script returned HTML (likely error page or 404)', raw: data.substring(0, 100) };
             }
             // If it's just a string message, return it wrapped
             return { status: 'success', message: data };
        }
    }
    
    return data;

  } catch (error: any) {
    console.error(`Apps Script Network Error (${action}):`, error.message);
    if (error.response) {
        console.error(`Apps Script Error Response (${action}):`, error.response.status, error.response.data);
        return { status: 'error', message: `Apps Script Error: ${error.response.status}`, details: typeof error.response.data === 'string' ? error.response.data.substring(0, 200) : error.response.data };
    }
    return { status: 'error', message: error.toString() };
  }
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mode: "proxy_only", env_check: !!GOOGLE_SCRIPT_URL });
});

app.get("/api/data", async (req, res) => {
  try {
    const result = await callAppsScript('getData');
    console.log('Apps Script Result (getData):', JSON.stringify(result).substring(0, 200) + '...');
    if (result.status === 'success') {
      res.json(result.data);
    } else {
      console.error("Failed to fetch data from Apps Script:", result);
      res.status(502).json({ 
        error: "Failed to fetch data from Google Sheet", 
        details: result.message,
        raw: result.raw 
      });
    }
  } catch (e: any) {
    console.error("Error in /api/data:", e);
    res.status(500).json({ error: "Internal Server Error", details: e.message });
  }
});

app.post("/api/participants", async (req, res) => {
  try {
    const result = await callAppsScript('addParticipant', req.body);
    res.json(result);
  } catch (e: any) {
    console.error("Error in /api/participants:", e);
    res.status(500).json({ status: 'error', message: e.toString() });
  }
});

app.post("/api/participants/status", async (req, res) => {
  try {
    const result = await callAppsScript('updateParticipantStatus', req.body);
    res.json(result);
  } catch (e: any) {
    console.error("Error in /api/participants/status:", e);
    res.status(500).json({ status: 'error', message: e.toString() });
  }
});

app.post("/api/participants/tid", async (req, res) => {
  try {
    const result = await callAppsScript('updateParticipantTID', req.body);
    res.json(result);
  } catch (e: any) {
    console.error("Error in /api/participants/tid:", e);
    res.status(500).json({ status: 'error', message: e.toString() });
  }
});

app.post("/api/participants/winner", async (req, res) => {
  try {
    const result = await callAppsScript('updateParticipantWinner', req.body);
    res.json(result);
  } catch (e: any) {
    console.error("Error in /api/participants/winner:", e);
    res.status(500).json({ status: 'error', message: e.toString() });
  }
});

app.post("/api/tiers", async (req, res) => {
  try {
    console.log("POST /api/tiers payload:", JSON.stringify(req.body).substring(0, 100) + "...");
    const result = await callAppsScript('saveTiers', { tiers: req.body });
    res.json(result);
  } catch (e: any) {
    console.error("Error in /api/tiers:", e);
    res.status(500).json({ status: 'error', message: e.toString() });
  }
});

app.post("/api/announcements", async (req, res) => {
  try {
    const result = await callAppsScript('saveAnnouncements', { announcements: req.body });
    res.json(result);
  } catch (e: any) {
    console.error("Error in /api/announcements:", e);
    res.status(500).json({ status: 'error', message: e.toString() });
  }
});

app.post("/api/ads", async (req, res) => {
  try {
    const result = await callAppsScript('saveAds', { ads: req.body });
    res.json(result);
  } catch (e: any) {
    console.error("Error in /api/ads:", e);
    res.status(500).json({ status: 'error', message: e.toString() });
  }
});

app.post("/api/terms", async (req, res) => {
  try {
    const result = await callAppsScript('saveTerms', { terms: req.body });
    res.json(result);
  } catch (e: any) {
    console.error("Error in /api/terms:", e);
    res.status(500).json({ status: 'error', message: e.toString() });
  }
});

app.post("/api/global-ads", async (req, res) => {
  try {
    const result = await callAppsScript('saveGlobalAds', { globalAds: req.body });
    res.json(result);
  } catch (e: any) {
    console.error("Error in /api/global-ads:", e);
    res.status(500).json({ status: 'error', message: e.toString() });
  }
});

app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await callAppsScript('login', { username: username || 'admin', password });
    res.json(result);
  } catch (e: any) {
    console.error("Error in /api/admin/login:", e);
    res.status(500).json({ status: 'error', message: e.toString() });
  }
});

app.post("/api/admin/update-credentials", async (req, res) => {
  try {
    const result = await callAppsScript('updateAdminCredentials', req.body);
    res.json(result);
  } catch (e: any) {
    console.error("Error in /api/admin/update-credentials:", e);
    res.status(500).json({ status: 'error', message: e.toString() });
  }
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
