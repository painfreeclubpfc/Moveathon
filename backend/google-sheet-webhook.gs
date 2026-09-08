/**
 * Move-a-thon Progress Score (MPS) → Google Sheet webhook  ·  v2
 * -------------------------------------------------------------
 * Zero-cost fallback backend. Writes each event to its own tab:
 *   • "Badges"      — one row per earned theme-badge
 *   • "Members"     — one row per member profile update (rollup)
 *   • "Graduation"  — one row per completed member
 *
 * NOTE: the Sheet is WRITE-ONLY, so it can't restore a returning member's
 * badges across the break/device the way Supabase can. Use it only for a
 * single-run / single-device pilot; prefer supabase-schema.sql otherwise.
 *
 * SETUP
 * 1. Open the target Google Sheet → Extensions → Apps Script.
 * 2. Delete anything there, paste this whole file.
 * 3. Deploy → New deployment → Web app → Execute as: Me → Who has access:
 *    Anyone → Deploy → Authorize → copy the Web app URL.
 * 4. Paste it into CONFIG.SHEET_WEBHOOK_URL in index.html.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var d = {};
    try { d = JSON.parse(e.postData.contents); } catch (err) { d = e.parameter || {}; }
    var kind = d.kind || 'badge';
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (kind === 'member') {
      appendRow(ss, 'Members',
        ['Updated At','Member (email)','Name','Phone','Goal','Cohort Joined','Join Week','Badges Earned','Status'],
        [new Date(), d.member_id, d.name, d.phone, d.goal, d.cohort_joined, d.join_program_week, d.badges_earned, d.status]);
    } else if (kind === 'graduation') {
      appendRow(ss, 'Graduation',
        ['At','Member (email)','Name','Phone','Goal','Overall','Best4 Avg','Distinction','Badges Earned','Final Goal Closeness','Final Reflection'],
        [new Date(), d.member_id, d.name, d.phone, d.goal, d.overall, d.best4_avg, d.distinction ? 'YES' : 'no', d.badges_earned, d.final_goal_closeness, d.final_reflection]);
    } else { // badge
      appendRow(ss, 'Badges',
        ['Earned At','Member (email)','Name','Phone','Theme Id','Theme','Cohort','Program Week','Score',
         'Pain','Confidence','Movement','Strength','Consistency','Challenges','Reps','Sessions Attended','Challenges Done','Goal Closeness'],
        [d.earned_at || new Date(), d.member_id, d.name, d.phone, d.theme_id, d.theme_name, d.cohort_id, d.program_week, d.score,
         d.pain, d.confidence, d.movement, d.strength, d.consistency, d.challenges, d.reps, d.sessions_attended, d.challenges_done, d.goal_closeness]);
    }
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function appendRow(ss, tab, headers, row) {
  var sheet = ss.getSheetByName(tab) || ss.insertSheet(tab);
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  sheet.appendRow(row.map(function(v){ return (v === undefined || v === null) ? '' : v; }));
}

function doGet() {
  return ContentService.createTextOutput('Move-a-thon MPS webhook is live.');
}
