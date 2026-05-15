// ─── Faith & Fitness ── Language / Translation Module ────────────────────────
// Usage:
//   import { t, getLang, setLang, applyLang } from "./lang.js";
//
//   t("vote_now")        → "Vote Now"  or  "ഇപ്പോൾ വോട്ട് ചെയ്യൂ"
//   applyLang()          → replaces all [data-i18n="key"] elements in the DOM
//   setLang("ml")        → saves to localStorage + Firestore user doc (if logged in)
// ─────────────────────────────────────────────────────────────────────────────

import { db } from "./firebase.js";
import { doc, updateDoc, query, collection, where, getDocs }
  from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

/* ════════════════════════════════════════════
   DICTIONARIES
════════════════════════════════════════════ */
const DICT = {

  /* ─── Login page ─── */
  login_title:          { en: "Faith & Fitness",              ml: "Faith & Fitness" },
  login_tab_user:       { en: "User Login",                   ml: "ഉപയോക്തൃ ലോഗിൻ" },
  login_tab_admin:      { en: "Admin Login",                  ml: "അഡ്മിൻ ലോഗിൻ" },
  login_phone:          { en: "Phone Number",                 ml: "ഫോൺ നമ്പർ" },
  login_password:       { en: "Password",                     ml: "പാസ്‌വേഡ്" },
  login_btn:            { en: "Login",                        ml: "ലോഗിൻ" },
  login_signup_link:    { en: "New here? Sign up",            ml: "പുതിയ ആളോ? സൈൻ അപ്പ് ചെയ്യൂ" },
  login_forgot:         { en: "Forgot password?",             ml: "പാസ്‌വേഡ് മറന്നോ?" },
  signup_name:          { en: "Full Name",                    ml: "പൂർണ്ണ പേര്" },
  signup_dob:           { en: "Date of Birth",                ml: "ജനന തീയതി" },
  signup_btn:           { en: "Create Account",               ml: "അക്കൗണ്ട് ഉണ്ടാക്കൂ" },
  signup_back:          { en: "Back to login",                ml: "ലോഗിനിലേക്ക് മടങ്ങൂ" },

  /* ─── User home (voting) ─── */
  home_greeting:        { en: "Hello",                        ml: "ഹലോ" },
  home_voting_open:     { en: "Voting is Open!",              ml: "വോട്ടിംഗ് തുറന്നിരിക്കുന്നു!" },
  home_voting_closed:   { en: "Voting is Closed",             ml: "വോട്ടിംഗ് അടഞ്ഞിരിക്കുന്നു" },
  home_opens_at:        { en: "Opens at 8 PM",                ml: "രാത്രി 8 മണിക്ക് തുറക്കും" },
  home_closes_at:       { en: "Closes at",                    ml: "അടയ്ക്കുന്ന സമയം" },
  home_already_voted:   { en: "You already voted today ✅",   ml: "ഇന്ന് നിങ്ങൾ ഇതിനകം വോട്ട് ചെയ്തു ✅" },
  home_submit:          { en: "Submit Vote",                  ml: "വോട്ട് സമർപ്പിക്കൂ" },
  home_select_tasks:    { en: "Select your completed tasks",  ml: "പൂർത്തിയാക്കിയ ടാസ്കുകൾ തിരഞ്ഞെടുക്കൂ" },
  home_no_tasks:        { en: "No tasks available today.",    ml: "ഇന്ന് ടാസ്കുകൾ ഒന്നുമില്ല." },
  home_points_preview:  { en: "Points this vote",             ml: "ഈ വോട്ടിലെ പോയിന്റ്" },
  home_leaderboard:     { en: "Leaderboard",                  ml: "ലീഡർബോർഡ്" },
  home_rank:            { en: "Rank",                         ml: "റാങ്ക്" },
  home_name:            { en: "Name",                         ml: "പേര്" },
  home_points:          { en: "Points",                       ml: "പോയിന്റ്" },
  home_streak:          { en: "Streak",                       ml: "സ്‌ട്രീക്ക്" },
  home_voted_success:   { en: "Vote submitted! 🎉",           ml: "വോട്ട് സമർപ്പിച്ചു! 🎉" },
  home_achievement_unlocked: { en: "Achievement Unlocked! 🏆", ml: "നേട്ടം അൺലോക്ക് ആയി! 🏆" },
  home_close:           { en: "Close",                        ml: "അടയ്ക്കൂ" },

  /* ─── User profile ─── */
  profile_title:        { en: "My Profile",                   ml: "എന്റെ പ്രൊഫൈൽ" },
  profile_name:         { en: "Display Name",                 ml: "പ്രദർശന നാമം" },
  profile_dob:          { en: "Date of Birth",                ml: "ജനന തീയതി" },
  profile_phone:        { en: "Phone",                        ml: "ഫോൺ" },
  profile_save:         { en: "Save Changes",                 ml: "മാറ്റങ്ങൾ സംരക്ഷിക്കൂ" },
  profile_stats:        { en: "My Stats",                     ml: "എന്റെ സ്‌റ്റാറ്റ്" },
  profile_total_pts:    { en: "Total Points",                 ml: "ആകെ പോയിന്റ്" },
  profile_best_streak:  { en: "Best Streak",                  ml: "ഏറ്റവും നല്ല സ്‌ട്രീക്ക്" },
  profile_weekly_rank:  { en: "Weekly Rank",                  ml: "വാരാന്ത്യ റാങ്ക്" },
  profile_monthly_rank: { en: "Monthly Rank",                 ml: "മാസ റാങ്ക്" },
  profile_alltime_rank: { en: "All-Time Rank",                ml: "സർവ്വകാല റാങ്ക്" },
  profile_votes:        { en: "Total Votes",                  ml: "ആകെ വോട്ടുകൾ" },
  profile_achievements: { en: "Achievements",                 ml: "നേട്ടങ്ങൾ" },
  profile_locked:       { en: "Locked",                       ml: "പൂട്ടിയിരിക്കുന്നു" },
  profile_avatar:       { en: "Choose Avatar",                ml: "അവതാർ തിരഞ്ഞെടുക്കൂ" },
  profile_saved:        { en: "Profile saved ✅",              ml: "പ്രൊഫൈൽ സേവ് ചെയ്തു ✅" },

  /* ─── User settings ─── */
  settings_title:       { en: "Settings",                     ml: "ക്രമീകരണങ്ങൾ" },
  settings_darkmode:    { en: "Dark Mode",                    ml: "ഡാർക്ക് മോഡ്" },
  settings_language:    { en: "Language",                     ml: "ഭാഷ" },
  settings_lang_en:     { en: "English",                      ml: "English" },
  settings_lang_ml:     { en: "Malayalam",                    ml: "മലയാളം" },
  settings_reminder:    { en: "Daily Reminder",               ml: "ദൈനംദിന ഓർമ്മപ്പെടുത്തൽ" },
  settings_reminder_type: { en: "Reminder Type",              ml: "ഓർമ്മപ്പെടുത്തൽ തരം" },
  settings_notify:      { en: "Notification",                 ml: "അറിയിപ്പ്" },
  settings_sound:       { en: "Sound",                        ml: "ശബ്ദം" },
  settings_vibrate:     { en: "Vibrate",                      ml: "വൈബ്രേഷൻ" },
  settings_save:        { en: "Save Settings",                ml: "ക്രമീകരണം സംരക്ഷിക്കൂ" },
  settings_saved:       { en: "Settings saved ✅",             ml: "ക്രമീകരണം സേവ് ചെയ്തു ✅" },
  settings_logout:      { en: "Logout",                       ml: "ലോഗ്ഔട്ട്" },

  /* ─── Notifications ─── */
  notif_title:          { en: "Notifications",                ml: "അറിയിപ്പുകൾ" },
  notif_empty:          { en: "No new notifications.",        ml: "പുതിയ അറിയിപ്പുകൾ ഒന്നുമില്ല." },
  notif_dismiss:        { en: "Dismiss",                      ml: "തള്ളിക്കളയൂ" },
  notif_vote_closes:    { en: "Voting closes in",             ml: "വോട്ടിംഗ് അടയ്ക്കും" },

  /* ─── Calendar ─── */
  cal_title:            { en: "Vote History",                 ml: "വോട്ട് ചരിത്രം" },
  cal_voted:            { en: "Voted",                        ml: "വോട്ട് ചെയ്തു" },
  cal_no_vote:          { en: "No vote",                      ml: "വോട്ടില്ല" },
  cal_tasks_done:       { en: "Tasks completed",              ml: "പൂർത്തിയാക്കിയ ടാസ്കുകൾ" },
  cal_no_details:       { en: "No vote details for this day.", ml: "ഈ ദിവസം വോട്ട് ഇല്ല." },
  cal_history:          { en: "Recent Votes",                 ml: "സമീപകാല വോട്ടുകൾ" },

  /* ─── Navigation bar ─── */
  nav_home:             { en: "Home",                         ml: "ഹോം" },
  nav_profile:          { en: "Profile",                      ml: "പ്രൊഫൈൽ" },
  nav_calendar:         { en: "Calendar",                     ml: "കലണ്ടർ" },
  nav_settings:         { en: "Settings",                     ml: "ക്രമീകരണം" },
  nav_notifications:    { en: "Alerts",                       ml: "അലേർട്ടുകൾ" },

  /* ─── Common ─── */
  common_loading:       { en: "Loading…",                     ml: "ലോഡ് ചെയ്യുന്നു…" },
  common_error:         { en: "Something went wrong.",        ml: "എന്തോ തകരാർ ഉണ്ടായി." },
  common_save:          { en: "Save",                         ml: "സേവ് ചെയ്യൂ" },
  common_cancel:        { en: "Cancel",                       ml: "റദ്ദാക്കൂ" },
  common_yes:           { en: "Yes",                          ml: "അതെ" },
  common_no:            { en: "No",                           ml: "ഇല്ല" },
  common_days:          { en: "days",                         ml: "ദിവസങ്ങൾ" },
  common_pts:           { en: "pts",                          ml: "പോയ്" },
};

/* ════════════════════════════════════════════
   LANGUAGE HELPERS
════════════════════════════════════════════ */

/** Get current language ("en" or "ml"), defaulting to "en" */
export function getLang(){
  return (localStorage.getItem("ff_lang") || "en").toLowerCase() === "ml" ? "ml" : "en";
}

/** Translate a key; falls back to the key itself if not found */
export function t(key){
  const lang  = getLang();
  const entry = DICT[key];
  if(!entry) return key;
  return entry[lang] || entry["en"] || key;
}

/**
 * Save language preference to localStorage.
 * If a phone is stored in ff_phone, also writes to Firestore user doc.
 */
export async function setLang(lang){
  const l = (lang === "ml") ? "ml" : "en";
  localStorage.setItem("ff_lang", l);

  const phone = localStorage.getItem("ff_phone");
  if(phone){
    try{
      const snap = await getDocs(
        query(collection(db,"users"), where("phone","==",phone))
      );
      if(!snap.empty){
        await updateDoc(doc(db,"users",snap.docs[0].id), { language: l });
      }
    }catch(e){ /* silent – settings saved in localStorage regardless */ }
  }
}

/**
 * Replace the textContent of every element that has [data-i18n="key"].
 * Also sets placeholder for inputs/textareas with [data-i18n-placeholder="key"].
 * Call this after the DOM is ready.
 */
export function applyLang(){
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
}
