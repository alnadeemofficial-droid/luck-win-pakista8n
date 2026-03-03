/**
 * LuckWin Backend - Ultimate Professional Version
 * 
 * Features:
 * - Robust JSON & Form Data Parsing
 * - Global Ads Management
 * - Referral System
 * - Admin Authentication
 * - Image Compression (Frontend handled, Backend stores base64/url)
 * - Error Handling & Logging
 */

// --- Main Entry Points ---

function doGet(e) {
  var action = e.parameter.action;
  if (action === 'getData') {
    return getData();
  }
  return ContentService.createTextOutput("LuckWin Backend is Running. Use POST requests.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Wait for up to 30 seconds for other processes to finish.
  if (!lock.tryLock(30000)) {
    return createJSONOutput({ status: 'error', message: 'Server is busy. Please try again.' });
  }

  try {
    var data = {};
    
    // 1. Try parsing JSON body
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        console.warn("JSON Parse Error:", err);
      }
    }
    
    // 2. Merge with Form Parameters (if any)
    if (e.parameter) {
      for (var key in e.parameter) {
        // If parameter is a JSON string (like 'tiers'), parse it
        try {
            var parsed = JSON.parse(e.parameter[key]);
            if (typeof parsed === 'object') {
                data[key] = parsed;
            } else {
                data[key] = e.parameter[key];
            }
        } catch (err) {
            data[key] = e.parameter[key];
        }
      }
    }

    var action = data.action || e.parameter.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var output = {};

    if (action === 'getData') {
      output = getAllData(ss);
    } else if (action === 'addParticipant') {
      output = addParticipant(ss, data);
    } else if (action === 'updateParticipantStatus') {
      output = updateParticipantStatus(ss, data);
    } else if (action === 'updateParticipantTID') {
      output = updateParticipantTID(ss, data);
    } else if (action === 'updateParticipantWinner') {
      output = updateParticipantWinner(ss, data);
    } else if (action === 'saveTiers') {
      output = saveTiers(ss, data);
    } else if (action === 'saveAnnouncements') {
      output = saveAnnouncements(ss, data);
    } else if (action === 'saveAds') {
      output = saveAds(ss, data);
    } else if (action === 'saveGlobalAds') {
      output = saveGlobalAds(ss, data);
    } else if (action === 'saveTerms') {
      output = saveTerms(ss, data);
    } else if (action === 'login') {
      output = handleLogin(ss, data);
    } else {
      output = { status: 'error', message: 'Unknown action: ' + action };
    }

    return createJSONOutput(output);

  } catch (e) {
    console.error("Server Error:", e);
    return createJSONOutput({ status: 'error', message: e.toString(), stack: e.stack });
  } finally {
    lock.releaseLock();
  }
}

// --- Helper Functions ---

function createJSONOutput(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    // Set headers based on sheet name
    if (name === 'Participants') {
      sheet.appendRow(['ID', 'Name', 'Phone', 'Network', 'SecondaryPhone', 'SecondaryNetwork', 'WhatsApp', 'CategoryId', 'InvestAmount', 'TrackingId', 'Status', 'Timestamp', 'SecretToken', 'IsWinner', 'WinAmount', 'WinningDate', 'ReferredBy', 'ReferralCount']);
    } else if (name === 'Tiers') {
      sheet.appendRow(['ID', 'Data']);
    } else if (name === 'Announcements') {
      sheet.appendRow(['ID', 'Data']);
    } else if (name === 'Ads') {
      sheet.appendRow(['ID', 'Data']);
    } else if (name === 'GlobalAds') {
      sheet.appendRow(['ID', 'Data']);
    } else if (name === 'Terms') {
      sheet.appendRow(['ID', 'Data']);
    } else if (name === 'Admin') {
      sheet.appendRow(['Username', 'Password']);
      sheet.appendRow(['admin', 'admin123']); // Default credentials
    }
  }
  return sheet;
}

// --- Logic Functions ---

function getAllData(ss) {
  var pSheet = getOrCreateSheet(ss, 'Participants');
  var tSheet = getOrCreateSheet(ss, 'Tiers');
  var aSheet = getOrCreateSheet(ss, 'Announcements');
  var adSheet = getOrCreateSheet(ss, 'Ads');
  var gAdSheet = getOrCreateSheet(ss, 'GlobalAds');
  var termSheet = getOrCreateSheet(ss, 'Terms');

  var participants = [];
  var pData = pSheet.getDataRange().getValues();
  // Skip header
  for (var i = 1; i < pData.length; i++) {
    var row = pData[i];
    participants.push({
      id: row[0],
      name: row[1],
      phone: row[2],
      network: row[3],
      secondaryPhone: row[4],
      secondaryNetwork: row[5],
      whatsapp: row[6],
      categoryId: row[7],
      investAmount: row[8],
      trackingId: row[9],
      status: row[10],
      timestamp: new Date(row[11]).getTime(),
      secretToken: row[12],
      isWinner: row[13],
      winAmount: row[14],
      winningDate: row[15] ? new Date(row[15]).getTime() : null,
      referredBy: row[16],
      referralCount: row[17]
    });
  }

  var tiers = [];
  var tData = tSheet.getDataRange().getValues();
  for (var i = 1; i < tData.length; i++) {
    if (tData[i][1]) {
      try {
        tiers.push(JSON.parse(tData[i][1]));
      } catch (e) {
        console.warn("Skipping invalid JSON in Tiers row " + (i+1));
      }
    }
  }

  var announcements = [];
  var aData = aSheet.getDataRange().getValues();
  for (var i = 1; i < aData.length; i++) {
    if (aData[i][1]) {
      try {
        announcements.push(JSON.parse(aData[i][1]));
      } catch (e) {
        console.warn("Skipping invalid JSON in Announcements row " + (i+1));
      }
    }
  }

  var ads = [];
  var adData = adSheet.getDataRange().getValues();
  for (var i = 1; i < adData.length; i++) {
    if (adData[i][1]) {
      try {
        ads.push(JSON.parse(adData[i][1]));
      } catch (e) {
        console.warn("Skipping invalid JSON in Ads row " + (i+1));
      }
    }
  }
  
  var globalAds = [];
  var gAdData = gAdSheet.getDataRange().getValues();
  for (var i = 1; i < gAdData.length; i++) {
    if (gAdData[i][1]) {
      try {
        globalAds.push(JSON.parse(gAdData[i][1]));
      } catch (e) {
        console.warn("Skipping invalid JSON in GlobalAds row " + (i+1));
      }
    }
  }

  var terms = [];
  var termData = termSheet.getDataRange().getValues();
  for (var i = 1; i < termData.length; i++) {
    if (termData[i][1]) {
      try {
        terms.push(JSON.parse(termData[i][1]));
      } catch (e) {
        console.warn("Skipping invalid JSON in Terms row " + (i+1));
      }
    }
  }

  return { 
    status: 'success', 
    data: { 
      participants: participants, 
      tiers: tiers, 
      announcements: announcements, 
      ads: ads,
      globalAds: globalAds,
      terms: terms 
    } 
  };
}

function addParticipant(ss, data) {
  var sheet = getOrCreateSheet(ss, 'Participants');
  
  // Check for duplicates
  var allData = sheet.getDataRange().getValues();
  for (var i = 1; i < allData.length; i++) {
    if (allData[i][2] == data.phone && allData[i][7] == data.categoryId) {
       return { status: 'error', message: 'Already registered for this card.' };
    }
  }

  // Handle Referral
  var referredBy = '';
  if (data.referredBy) {
    // Find referrer by Secret Token or Phone
    for (var i = 1; i < allData.length; i++) {
      if (allData[i][12] == data.referredBy || allData[i][2] == data.referredBy) {
        referredBy = allData[i][0]; // Store Referrer ID
        // Increment referrer count
        var currentCount = allData[i][17] || 0;
        sheet.getRange(i + 1, 18).setValue(currentCount + 1);
        break;
      }
    }
  }

  var newRow = [
    data.id,
    data.name,
    data.phone,
    data.network,
    data.secondaryPhone || '',
    data.secondaryNetwork || '',
    data.whatsapp || '',
    data.categoryId,
    data.investAmount,
    data.trackingId,
    data.status,
    new Date().toISOString(), // Store as ISO string
    data.secretToken,
    false, // isWinner
    0, // winAmount
    '', // winningDate
    referredBy,
    0 // referralCount
  ];
  
  sheet.appendRow(newRow);
  return { status: 'success', message: 'Participant added' };
}

function updateParticipantStatus(ss, data) {
  var sheet = getOrCreateSheet(ss, 'Participants');
  var values = sheet.getDataRange().getValues();
  
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] == data.id) {
      sheet.getRange(i + 1, 11).setValue(data.status);
      return { status: 'success', message: 'Status updated' };
    }
  }
  return { status: 'error', message: 'Participant not found' };
}

function updateParticipantTID(ss, data) {
  var sheet = getOrCreateSheet(ss, 'Participants');
  var values = sheet.getDataRange().getValues();
  
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] == data.id) {
      sheet.getRange(i + 1, 10).setValue(data.trackingId);
      sheet.getRange(i + 1, 11).setValue(data.status);
      return { status: 'success', message: 'TID updated' };
    }
  }
  return { status: 'error', message: 'Participant not found' };
}

function updateParticipantWinner(ss, data) {
  var sheet = getOrCreateSheet(ss, 'Participants');
  var values = sheet.getDataRange().getValues();
  
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] == data.id) {
      sheet.getRange(i + 1, 14).setValue(true);
      sheet.getRange(i + 1, 15).setValue(data.winAmount);
      sheet.getRange(i + 1, 16).setValue(new Date(data.winningDate).toISOString());
      return { status: 'success', message: 'Winner updated' };
    }
  }
  return { status: 'error', message: 'Participant not found' };
}

function saveTiers(ss, data) {
  var sheet = getOrCreateSheet(ss, 'Tiers');
  // Clear old data but keep header
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 2).clearContent();
  }
  
  var tiers = data.tiers;
  if (tiers && tiers.length > 0) {
    var rows = tiers.map(function(t) { return [t.id, JSON.stringify(t)]; });
    sheet.getRange(2, 1, rows.length, 2).setValues(rows);
  }
  return { status: 'success', message: 'Tiers saved' };
}

function saveAnnouncements(ss, data) {
  var sheet = getOrCreateSheet(ss, 'Announcements');
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 2).clearContent();
  }
  
  var anns = data.announcements;
  if (anns && anns.length > 0) {
    var rows = anns.map(function(a) { return [a.id, JSON.stringify(a)]; });
    sheet.getRange(2, 1, rows.length, 2).setValues(rows);
  }
  return { status: 'success', message: 'Announcements saved' };
}

function saveAds(ss, data) {
  var sheet = getOrCreateSheet(ss, 'Ads');
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 2).clearContent();
  }
  
  var ads = data.ads;
  if (ads && ads.length > 0) {
    var rows = ads.map(function(a) { return [a.id, JSON.stringify(a)]; });
    sheet.getRange(2, 1, rows.length, 2).setValues(rows);
  }
  return { status: 'success', message: 'Ads saved' };
}

function saveGlobalAds(ss, data) {
  var sheet = getOrCreateSheet(ss, 'GlobalAds');
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 2).clearContent();
  }
  
  var gAds = data.globalAds;
  if (gAds && gAds.length > 0) {
    var rows = gAds.map(function(a) { return [a.id, JSON.stringify(a)]; });
    sheet.getRange(2, 1, rows.length, 2).setValues(rows);
  }
  return { status: 'success', message: 'Global Ads saved' };
}

function saveTerms(ss, data) {
  var sheet = getOrCreateSheet(ss, 'Terms');
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 2).clearContent();
  }
  
  var terms = data.terms;
  if (terms && terms.length > 0) {
    var rows = terms.map(function(t) { return [t.id, JSON.stringify(t)]; });
    sheet.getRange(2, 1, rows.length, 2).setValues(rows);
  }
  return { status: 'success', message: 'Terms saved' };
}

function handleLogin(ss, data) {
  var sheet = getOrCreateSheet(ss, 'Admin');
  var values = sheet.getDataRange().getValues();
  
  // Check if we have data rows
  if (values.length < 2) {
     return { status: 'error', message: 'Admin credentials not set in sheet.' };
  }

  // Dynamic Column Mapping
  var headers = values[0];
  var userIndex = headers.indexOf('Username');
  var passIndex = headers.indexOf('Password');
  
  // Fallback to default columns if headers are missing/changed
  if (userIndex === -1) userIndex = 0;
  if (passIndex === -1) passIndex = 1;

  // Get stored credentials directly from sheet (Row 2)
  var storedUser = String(values[1][userIndex]);
  var storedPass = String(values[1][passIndex]);
  
  // Get input credentials
  var inputUser = String(data.username || '');
  var inputPass = String(data.password || '');

  // Strict comparison (trimming whitespace is safe practice)
  if (inputUser.trim() === storedUser.trim() && inputPass.trim() === storedPass.trim()) {
    return { status: 'success', message: 'Login successful' };
  }
  
  return { status: 'error', message: 'Invalid credentials' };
}
