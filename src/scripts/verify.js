#!/usr/bin/env node
/**
 * Zoho CRM Edumate Section Organizer (All-in-One)
 * =================================================
 *
 * Purpose:
 *   Organizes 108 EXISTING custom fields in the Contacts module into
 *   7 logical sections within the Edumate layout.
 *
 * What this does:
 *   1. Verifies the Edumate layout exists
 *   2. Creates 7 sections in the layout (skips existing)
 *   3. Moves each existing custom field into its assigned section
 *
 * Important: This script does NOT create new fields. All 108 fields
 * must already exist in Zoho (as per zoho_contacts_fields.xlsx).
 *
 * Run modes:
 *   --dry-run             Preview changes without API writes
 *   --section <name>      Process only one section
 *   --verify              Verify which fields exist before assignment
 *
 * Usage:
 *   node edumate-organize.js --dry-run
 *   node edumate-organize.js --verify
 *   node edumate-organize.js --section Personal_Information
 *   node edumate-organize.js                  # full run
 *
 * Prerequisites:
 *   npm install axios dotenv
 *
 * Environment variables (.env file):
 *   ZOHO_CLIENT_ID=...
 *   ZOHO_CLIENT_SECRET=...
 *   ZOHO_REFRESH_TOKEN=...
 *   ZOHO_DC=in
 */

'use strict';

require('dotenv').config();

const axios = require('axios');
const fs = require('fs');
const path = require('path');


// ====================================================================
//                       SECTION 1: CONFIG
// ====================================================================

const CLIENT_ID = process.env.ZOHO_CLIENT_ID || '1000.22UHQ32K6F2O00NU848RY3V0SHPTKR';
const CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET || 'ff0354807c9ab47add23cc9b0add9abf84148db440';
const REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN || '1000.1ad1bcf4d9a8abc7ad8c5deef742a972.d69760561e535a81cdb41cc772d8c3b8';
const DC = process.env.ZOHO_DC || 'in';

const ACCOUNTS_URL = `https://accounts.zoho.${DC}`;
const API_BASE = `https://www.zohoapis.${DC}/crm/v8`;

const MODULE = 'Contacts';
const LAYOUT_NAME = 'Edumate';

const SLEEP_BETWEEN_CALLS = 500;
const SLEEP_AFTER_ERROR = 2000;


// ====================================================================
//                  SECTION 2: SECTION ASSIGNMENTS
// ====================================================================
//
// Maps each EXISTING field's API name to the section it should belong
// to in the Edumate layout. Section display labels are auto-derived by
// replacing underscores with spaces:
//   "Personal_Information" → "Personal Information"
//
// To move a field to a different section: cut its api_name from one
// section's array and paste it into another. Re-run the script.
// ====================================================================

const SECTION_ASSIGNMENTS = {

  // ----------------------------------------------------------------
  // SECTION 1: Personal Information
  // Maps to Prisma model: HSEdumateContactsPersonalInformation
  // Note: First_Name, Last_Name, Email, Mobile, Phone, Date_of_Birth
  //       are Zoho default fields — they stay in default sections.
  // ----------------------------------------------------------------
  Personal_Information: [
    'Gender',
    'Nationality',
    'Current_Address',
    'City_Current_Address',
    'State_Current_Address',
    'Country_Current_Address',
    'Pincode_Current_Address',
    'Permanent_Address',
    'City_Permanent_Address',
    'State_Permanent_Address',
    'Country_Permanent_Address',
    'Pincode_Permanent_Address',
  ],

  // ----------------------------------------------------------------
  // SECTION 2: Academic Profile
  // Maps to Prisma model: HSEdumateContactsAcademicProfiles
  // ----------------------------------------------------------------
  Academic_Profile: [
    'Current_Education_Level',
    'Current_Institution',
    'Current_Course_Major',
    'Current_Cgpa_Percentage',
    'Current_Graduation_Year',
    'Target_Degree_Level',
    'Target_Course_Major',
    'Target_Universities',
    'Intended_Study_Destination',
    'Intended_Start_Term',
    'Intended_Start_Date',
    'Intake_Month',
    'Intake_Year',
    'Course_Duration_Months',
    'Course_Type',
    'Admission_Status',
    'Intended_Field_Of_Post_Graduate_Program',
    'Intended_Post_Graduate_program_start_year',
    'Universities_Of_Interest_Final',
    'Universities_Applied_To_Final',
    'Universities_Admitted_To_Final',
    'Program_Of_Interest_Final',
    // Test scores
    'Gre_Score',
    'Gmat_Score',
    'Toefl_Score',
    'Ielts_Score',
    'Sat_Score',
    'Cat_Score',
    'Xat_Score',
    'Nmat_Score',
    'Duolingo_Score',
    'Other_Test_Scores',
  ],

  // ----------------------------------------------------------------
  // SECTION 3: Application Journey
  // Maps to Prisma model: HSEdumateContactsApplicationJourney
  // ----------------------------------------------------------------
  Application_Journey: [
    'Priority_Level',
    'Current_Status_Disposition',
    'Current_Status_Disposition_Reason',
    'Lifecycle_Stages',
    'Lifecycle_Stages_Status',
    'First_Contact_Date',
    'Last_Modified_Date',
  ],

  // ----------------------------------------------------------------
  // SECTION 4: Financial Information
  // Maps to Prisma model: HSEdumateContactsFinancialInfo
  // Includes loan amounts, collateral, and all 3 co-applicants.
  // ----------------------------------------------------------------
  Financial_Information: [
    // Income & cost
    'Annual_Family_Income',
    'Total_Course_Cost',
    'Tuition_Fee',
    'Living_Expenses',
    'Other_Expenses',
    'Loan_Amount_Required',
    'Scholarship_Amount',
    'Self_Funding_Amount',
    // Currencies
    'Base_Currency',
    'Edumate_Currency',
    'Study_Destination_Currency',
    'User_Selected_Currency',
    // Collateral 1
    'Collateral_Available',
    'Collateral_Type',
    'Collateral_Value',
    // Collateral 2
    'Collateral_2_Available',
    'Collateral_2_Type',
    'Collateral_2_Value',
    // Co-applicant 1
    'Co_Applicant_1_Name',
    'Co_Applicant_1_Relationship',
    'Co_Applicant_1_Occupation',
    'Co_Applicant_1_Income',
    'Co_Applicant_1_Email',
    'Co_Applicant_1_Mobile_Number',
    // Co-applicant 2 (note: email/mobile API names use 'Coapplicant_2_*')
    'Co_Applicant_2_Name',
    'Co_Applicant_2_Relationship',
    'Co_Applicant_2_Occupation',
    'Co_Applicant_2_Income',
    'Coapplicant_2_Email',
    'Coapplicant_2_Mobile_Number',
    // Co-applicant 3 (same naming quirk as 2)
    'Co_Applicant_3_Name',
    'Co_Applicant_3_Relationship',
    'Co_Applicant_3_Occupation',
    'Co_Applicant_3_Income',
    'Coapplicant_3_Email',
    'Coapplicant_3_Mobile_Number',
  ],

  // ----------------------------------------------------------------
  // SECTION 5: Loan Preferences
  // Maps to Prisma model: HSEdumateContactsLoanPreferences
  // ----------------------------------------------------------------
  Loan_Preferences: [
    'Loan_Type_Preference',
    'Preferred_Lenders',
    'Repayment_Type_Preference',
    'Interested_Loan_Products',
  ],

  // ----------------------------------------------------------------
  // SECTION 6: Lead Attribution
  // Maps to Prisma model: HSEdumateContactsLeadAttribution
  // (Lead_Source is a Zoho default field — left as-is)
  // ----------------------------------------------------------------
  Lead_Attribution: [
    'Lead_Reference_Code',
    'Lead_Source_Detail',
    'Lead_Quality_Score',
    'Referral_Person_Name',
    'Referral_Person_Contact',
    'Utm_Source',
    'Utm_Medium',
    'Utm_Campaign',
    'Utm_Content',
    'Utm_Term',
  ],

  // ----------------------------------------------------------------
  // SECTION 7: System Tracking
  // Maps to Prisma model: HSEdumateContactsSystemTracking
  // ----------------------------------------------------------------
  System_Tracking: [
    'Seed_Contact',
    'Student_Record_Status',
    'Edumate_Data_Source',
    'Gdpr_Consent',
    'Marketing_Consent',
    'Db_Id',
    'Created_Date',
  ],
};


// ====================================================================
//                       SECTION 3: LOGGING
// ====================================================================

const LOG_FILE = path.join(__dirname, 'edumate-organize.log');
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

function log(level, msg) {
  const ts = new Date().toISOString();
  const line = `${ts} [${level}] ${msg}`;
  console.log(line);
  logStream.write(line + '\n');
}

const info = (m) => log('INFO', m);
const warn = (m) => log('WARN', m);
const error = (m) => log('ERROR', m);


// ====================================================================
//                       SECTION 4: UTILITIES
// ====================================================================

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { dryRun: false, section: null, verify: false, summary: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dry-run') opts.dryRun = true;
    else if (args[i] === '--verify') opts.verify = true;
    else if (args[i] === '--summary') opts.summary = true;
    else if (args[i] === '--section') opts.section = args[++i];
  }
  return opts;
}

function printSummary() {
  let total = 0;
  console.log('\n' + '='.repeat(60));
  console.log('EDUMATE SECTION ASSIGNMENT SUMMARY');
  console.log('='.repeat(60));
  for (const [section, fields] of Object.entries(SECTION_ASSIGNMENTS)) {
    const count = fields.length;
    total += count;
    console.log(`  ${section.padEnd(30)} → ${count} fields`);
  }
  console.log('-'.repeat(60));
  const sectionCount = Object.keys(SECTION_ASSIGNMENTS).length;
  console.log(`  ${'TOTAL'.padEnd(30)} → ${total} fields across ${sectionCount} sections`);
  console.log('='.repeat(60));

  // Detect duplicate assignments
  const seen = new Map();
  const dupes = [];
  for (const [section, fields] of Object.entries(SECTION_ASSIGNMENTS)) {
    for (const f of fields) {
      if (seen.has(f)) {
        dupes.push(`${f} appears in both '${seen.get(f)}' and '${section}'`);
      } else {
        seen.set(f, section);
      }
    }
  }
  if (dupes.length > 0) {
    console.log('\n⚠️  DUPLICATE ASSIGNMENTS:');
    dupes.forEach((d) => console.log(`  ${d}`));
  } else {
    console.log('\n✓ No duplicate assignments.');
  }
  console.log();
}


// ====================================================================
//                       SECTION 5: ZOHO CLIENT
// ====================================================================

class ZohoClient {
  constructor(clientId, clientSecret, refreshToken) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.refreshToken = refreshToken;
    this.accessToken = null;
    this.tokenExpiresAt = 0;
  }

  async refreshAccessToken() {
    info('Refreshing access token...');
    try {
      const res = await axios.post(`${ACCOUNTS_URL}/oauth/v2/token`, null, {
        params: {
          refresh_token: this.refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'refresh_token',
        },
        timeout: 30000,
      });
      if (!res.data.access_token) {
        throw new Error(`Token refresh failed: ${JSON.stringify(res.data)}`);
      }
      this.accessToken = res.data.access_token;
      this.tokenExpiresAt = Date.now() + ((res.data.expires_in || 3600) - 300) * 1000;
      info('Token refreshed successfully.');
    } catch (err) {
      const detail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      throw new Error(`OAuth refresh failed: ${detail}`);
    }
  }

  async getHeaders() {
    if (!this.accessToken || Date.now() >= this.tokenExpiresAt) {
      await this.refreshAccessToken();
    }
    return {
      Authorization: `Zoho-oauthtoken ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  async request(method, urlPath, { data = null, params = null } = {}) {
    const url = `${API_BASE}${urlPath}`;
    let headers = await this.getHeaders();
    const res = await axios.request({
      method, url, headers, data, params,
      timeout: 30000,
      validateStatus: () => true,
    });
    if (res.status === 401) {
      warn('Got 401, refreshing token and retrying...');
      await this.refreshAccessToken();
      headers = await this.getHeaders();
      return axios.request({
        method, url, headers, data, params,
        timeout: 30000,
        validateStatus: () => true,
      });
    }
    return res;
  }

  get(urlPath, params) { return this.request('GET', urlPath, { params }); }
  post(urlPath, body) { return this.request('POST', urlPath, { data: body }); }
  put(urlPath, body) { return this.request('PUT', urlPath, { data: body }); }
  patch(urlPath, body) { return this.request('PATCH', urlPath, { data: body }); }
}


// ====================================================================
//                       SECTION 6: API HELPERS
// ====================================================================

async function getLayout(client, layoutName) {
  info(`Fetching layouts for module '${MODULE}'...`);
  const res = await client.get(`/settings/layouts?module=${MODULE}`);
  if (res.status !== 200) {
    throw new Error(`Failed to fetch layouts: HTTP ${res.status} ${JSON.stringify(res.data)}`);
  }
  const layouts = res.data?.layouts || [];
  const match = layouts.find((l) => l.name === layoutName);
  if (!match) {
    throw new Error(`Layout '${layoutName}' not found. Available: ${JSON.stringify(layouts.map((l) => l.name))}`);
  }
  info(`Found layout '${layoutName}' (id=${match.id}).`);
  return match;
}

async function getAllFields(client) {
  const res = await client.get(`/settings/fields?module=${MODULE}`);
  if (res.status !== 200) {
    throw new Error(`Failed to fetch fields: HTTP ${res.status} ${JSON.stringify(res.data)}`);
  }
  const fields = res.data?.fields || [];
  const map = new Map();
  for (const f of fields) {
    if (f.api_name) map.set(f.api_name, f);
  }
  info(`Fetched ${map.size} total fields from module '${MODULE}'.`);
  return map;
}

function buildSectionMap(layoutData) {
  const map = new Map();
  for (const s of layoutData?.sections || []) {
    if (s.display_label) map.set(s.display_label, s);
    if (s.api_name) map.set(s.api_name, s);
  }
  return map;
}

async function ensureSections(client, layout, sectionsNeeded, dryRun) {
  // ============================================================
  // STRATEGY: Use PATCH /settings/layouts/{id}?module=Contacts to
  // create new sections explicitly (Zoho v8 documented endpoint).
  //
  // Zoho limit: max 5 sections can be added/updated per PATCH call.
  // So we batch our section-creation requests in groups of 5.
  //
  // For each section in our config:
  //   - If it already exists in the layout → skip
  //   - Otherwise → add to a batch and PATCH the layout
  //
  // Section payload only needs `display_label` for creation;
  // Zoho auto-generates the section's api_name (with __s suffix).
  // ============================================================
  const SECTION_BATCH_SIZE = 5;  // Zoho hard limit per request

  const sectionMap = buildSectionMap(layout);
  const existingLabels = [...new Set(layout.sections.map((s) => s.display_label))];
  info(`Existing sections in layout: ${existingLabels.join(' | ')}`);

  const toCreate = [];
  const alreadyExists = [];

  for (const apiName of sectionsNeeded) {
    const displayLabel = apiName.replace(/_/g, ' ');
    if (sectionMap.has(displayLabel) || sectionMap.has(apiName)) {
      alreadyExists.push(displayLabel);
    } else {
      toCreate.push({ display_label: displayLabel });
    }
  }

  if (alreadyExists.length > 0) {
    info(`Sections already in layout (${alreadyExists.length}): ${alreadyExists.join(', ')}`);
  }

  if (toCreate.length === 0) {
    info('All target sections already exist. Nothing to create.');
    return;
  }

  if (dryRun) {
    info(`[DRY RUN] Would create ${toCreate.length} sections:`);
    toCreate.forEach((s) => info(`    - ${s.display_label}`));
    return;
  }

  // Batch the section-create calls (Zoho allows max 5 per request)
  const url = `/settings/layouts/${layout.id}?module=${MODULE}`;
  const totalBatches = Math.ceil(toCreate.length / SECTION_BATCH_SIZE);
  info(`Creating ${toCreate.length} sections in ${totalBatches} batch(es) of up to ${SECTION_BATCH_SIZE}...`);

  for (let i = 0; i < toCreate.length; i += SECTION_BATCH_SIZE) {
    const batch = toCreate.slice(i, i + SECTION_BATCH_SIZE);
    const batchNum = Math.floor(i / SECTION_BATCH_SIZE) + 1;
    info(`  Batch ${batchNum}/${totalBatches}: creating ${batch.length} section(s): ${batch.map((s) => s.display_label).join(', ')}`);

    const payload = { layouts: [{ sections: batch }] };
    const res = await client.patch(url, payload);

    if (res.status !== 200 && res.status !== 202) {
      throw new Error(`Failed to create sections (batch ${batchNum}): HTTP ${res.status} ${JSON.stringify(res.data)}`);
    }
    info(`  Batch ${batchNum} success: ${JSON.stringify(res.data).slice(0, 200)}...`);

    // Brief pause between batches to be polite to the API
    if (i + SECTION_BATCH_SIZE < toCreate.length) {
      await sleep(1000);
    }
  }

  info(`All ${toCreate.length} sections created successfully.`);
}

async function moveFieldToSection(client, fieldDef, sectionApiName, layoutId, sectionLookup, dryRun) {
  // NOTE: This function is now a thin compatibility wrapper.
  // Actual field-section linking happens in moveFieldsBatchPerSection()
  // because Zoho v8 requires sections.fields[] inside a layout PATCH,
  // NOT field-level PATCH (which doesn't actually link to a layout).
  const apiName = fieldDef.api_name;
  const targetDisplayLabel = sectionApiName.replace(/_/g, ' ');

  if (
    fieldDef.section?.api_name === sectionApiName ||
    fieldDef.section?.display_label === targetDisplayLabel
  ) {
    info(`  [OK] '${apiName}' already in '${targetDisplayLabel}'.`);
    return 'already_correct';
  }

  if (dryRun) {
    info(`  [DRY RUN] Would move '${apiName}' → '${targetDisplayLabel}'`);
    return 'would_move';
  }

  // Should not be called in live mode — moveFieldsBatchPerSection handles it.
  warn(`  Skipping legacy single-field move for '${apiName}' — use batch mode.`);
  return 'skipped';
}

/**
 * Correct Zoho v8 approach: PATCH /settings/layouts/{layout_id}?module=Contacts
 * with a payload that contains sections, each section has a `fields` array
 * listing the fields that belong to it.
 *
 * Zoho links the fields to the section in the specified layout.
 *
 * Limits:
 *   - max 5 sections per PATCH call (we send 1 section at a time anyway)
 *   - max 25 fields per PATCH call → batched inside this function
 */
async function moveFieldsBatchPerSection(client, layoutId, sectionLookup, sectionApiName, fieldList, allFields, dryRun) {
  const FIELD_BATCH_SIZE = 25;  // Zoho hard limit per PATCH call

  const targetDisplayLabel = sectionApiName.replace(/_/g, ' ');
  const targetSection = sectionLookup.get(targetDisplayLabel);

  if (!targetSection) {
    error(`  [FAIL] Section '${targetDisplayLabel}' not found in layout.`);
    return { moved: 0, error: fieldList.length, skipped_missing: 0, already_correct: 0 };
  }

  // Build the fields array, including their ID and api_name as required
  const fieldsToAttach = [];
  const stats = { moved: 0, error: 0, skipped_missing: 0, already_correct: 0 };

  for (const apiName of fieldList) {
    const fieldDef = allFields.get(apiName);
    if (!fieldDef) {
      warn(`  [SKIP] Field '${apiName}' not in Zoho.`);
      stats.skipped_missing++;
      continue;
    }
    // Already in target section?
    if (
      fieldDef.section?.api_name === targetSection.api_name ||
      fieldDef.section?.display_label === targetDisplayLabel
    ) {
      info(`  [OK] '${apiName}' already in '${targetDisplayLabel}'.`);
      stats.already_correct++;
      continue;
    }
    fieldsToAttach.push({
      id: fieldDef.id,
      api_name: fieldDef.api_name,
    });
  }

  if (fieldsToAttach.length === 0) {
    info(`  All fields already in '${targetDisplayLabel}' or missing.`);
    return stats;
  }

  if (dryRun) {
    info(`  [DRY RUN] Would attach ${fieldsToAttach.length} fields to '${targetDisplayLabel}':`);
    fieldsToAttach.forEach((f) => info(`      - ${f.api_name}`));
    stats.moved = fieldsToAttach.length;
    return stats;
  }

  // Send fields in batches of 25 (Zoho hard limit per PATCH call)
  const url = `/settings/layouts/${layoutId}?module=${MODULE}`;
  const totalBatches = Math.ceil(fieldsToAttach.length / FIELD_BATCH_SIZE);

  if (totalBatches > 1) {
    info(`  Splitting ${fieldsToAttach.length} fields into ${totalBatches} batches of up to ${FIELD_BATCH_SIZE}...`);
  }

  for (let i = 0; i < fieldsToAttach.length; i += FIELD_BATCH_SIZE) {
    const batch = fieldsToAttach.slice(i, i + FIELD_BATCH_SIZE);
    const batchNum = Math.floor(i / FIELD_BATCH_SIZE) + 1;

    if (totalBatches > 1) {
      info(`  Batch ${batchNum}/${totalBatches}: PATCH layout — attaching ${batch.length} fields to '${targetDisplayLabel}'...`);
    } else {
      info(`  PATCH layout: attaching ${batch.length} fields to '${targetDisplayLabel}'...`);
    }

    const payload = {
      layouts: [{
        sections: [{
          api_name: targetSection.api_name,
          fields: batch,
        }],
      }],
    };

    const res = await client.patch(url, payload);

    if ([200, 201, 202].includes(res.status)) {
      const layoutResults = res.data?.layouts || [];
      if (layoutResults[0]?.status === 'success' || layoutResults[0]?.code === 'SUCCESS') {
        info(`  [MOVED] ${batch.length} fields → '${targetDisplayLabel}'${totalBatches > 1 ? ` (batch ${batchNum}/${totalBatches})` : ''}`);
        stats.moved += batch.length;
      } else {
        error(`  [FAIL] Layout update failed (batch ${batchNum}): ${JSON.stringify(layoutResults)}`);
        stats.error += batch.length;
      }
    } else {
      error(`  [FAIL] HTTP ${res.status} (batch ${batchNum}): ${JSON.stringify(res.data)}`);
      stats.error += batch.length;
    }

    // Brief pause between batches
    if (i + FIELD_BATCH_SIZE < fieldsToAttach.length) {
      await sleep(1000);
    }
  }

  return stats;
}

function verifyFields(allFields, sectionsToProcess) {
  info('\nVerification: checking that all assigned fields exist in Zoho...');
  const missing = [];
  let present = 0;
  for (const [sectionApi, fieldList] of Object.entries(sectionsToProcess)) {
    for (const apiName of fieldList) {
      if (!allFields.has(apiName)) {
        missing.push(`${sectionApi}: ${apiName}`);
      } else {
        present++;
      }
    }
  }
  info(`  Fields present: ${present}`);
  info(`  Fields missing: ${missing.length}`);
  if (missing.length > 0) {
    error('  Missing fields (check Excel vs Zoho — names may differ):');
    missing.forEach((m) => error(`    - ${m}`));
  }
  return missing;
}


// ====================================================================
//                       SECTION 7: MAIN
// ====================================================================

async function main() {
  const { dryRun, section, verify, summary } = parseArgs();

  // --summary mode is offline (no API calls needed)
  if (summary) {
    printSummary();
    return;
  }

  info('='.repeat(60));
  info('EDUMATE SECTION ORGANIZER - START');
  info(`Mode: ${dryRun ? 'DRY RUN' : verify ? 'VERIFY ONLY' : 'LIVE'}`);
  if (section) info(`Filter: Only section '${section}'`);
  info('='.repeat(60));

  if (CLIENT_ID.startsWith('YOUR_')) {
    error('Please set ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN in .env');
    process.exit(1);
  }

  if (section && !SECTION_ASSIGNMENTS[section]) {
    error(`Unknown section: ${section}`);
    error(`Available: ${Object.keys(SECTION_ASSIGNMENTS).join(', ')}`);
    process.exit(1);
  }

  const client = new ZohoClient(CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN);

  try {
    // Step 1: Validate Edumate layout
    const layout = await getLayout(client, LAYOUT_NAME);

    // Step 2: Validate all assigned fields exist in Zoho
    const allFields = await getAllFields(client);
    const sectionsToProcess = section
      ? { [section]: SECTION_ASSIGNMENTS[section] }
      : SECTION_ASSIGNMENTS;

    const missing = verifyFields(allFields, sectionsToProcess);

    if (verify) {
      info('\nVerify-only mode. Stopping here.');
      info('='.repeat(60));
      return;
    }

    if (missing.length > 0 && !dryRun) {
      warn(`\n${missing.length} fields are missing in Zoho. Proceeding will skip them.`);
      warn('Tip: run with --verify to see all missing fields without changes.');
      await sleep(2000);
    }

    // Step 3: Create missing sections
    await ensureSections(client, layout, Object.keys(sectionsToProcess), dryRun);

    // Step 4: Re-fetch layout after section creation to get the
    // new sections' actual api_names (Zoho assigns __s-suffixed names).
    let updatedLayout = layout;
    if (!dryRun) {
      updatedLayout = await getLayout(client, LAYOUT_NAME);
    }

    // Build a lookup: display_label → section object (with real api_name).
    // This is needed because PATCH /settings/fields requires the real
    // section api_name (e.g. "Personal_Information__s"), not our config key.
    const sectionLookup = new Map();
    for (const s of updatedLayout.sections || []) {
      if (s.display_label) sectionLookup.set(s.display_label, s);
    }
    info(`Section lookup built with ${sectionLookup.size} sections.`);

    // Step 5: Move fields into sections — one PATCH per section,
    // attaching all of that section's fields in a single layout PATCH.
    // This is the correct Zoho v8 approach for layout-bound assignments.
    const stats = { moved: 0, already_correct: 0, would_move: 0, skipped_missing: 0, error: 0 };
    const errorSections = [];

    for (const [sectionApiName, fieldList] of Object.entries(sectionsToProcess)) {
      info(`\n--- Section: ${sectionApiName} (${fieldList.length} fields) ---`);
      const sectionStats = await moveFieldsBatchPerSection(
        client, layout.id, sectionLookup, sectionApiName, fieldList, allFields, dryRun,
      );
      stats.moved += sectionStats.moved || 0;
      stats.already_correct += sectionStats.already_correct || 0;
      stats.skipped_missing += sectionStats.skipped_missing || 0;
      stats.error += sectionStats.error || 0;
      if (sectionStats.error > 0) errorSections.push(sectionApiName);

      // Pause between section PATCH calls to be nice to the API
      await sleep(SLEEP_BETWEEN_CALLS);
    }

    if (dryRun) {
      stats.would_move = stats.moved;
      stats.moved = 0;
    }

    // Final summary
    info('\n' + '='.repeat(60));
    info('RUN COMPLETE');
    if (dryRun) {
      info(`  Would move:       ${stats.would_move}`);
    } else {
      info(`  Moved:            ${stats.moved}`);
    }
    info(`  Already correct:  ${stats.already_correct}`);
    info(`  Skipped (missing): ${stats.skipped_missing}`);
    info(`  Errors:           ${stats.error}`);
    if (errorSections.length > 0) {
      info(`  Failed sections:  ${JSON.stringify(errorSections)}`);
    }
    info('='.repeat(60));
  } catch (err) {
    error(`FATAL: ${err.message}`);
    if (err.stack) error(err.stack);
    process.exit(1);
  } finally {
    logStream.end();
  }
}

main();