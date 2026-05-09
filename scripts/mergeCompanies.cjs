const fs = require('fs');
const https = require('https');

async function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Node.js' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
        } else {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function fetchText(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Node.js' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) resolve(data);
        else resolve('');
      });
    }).on('error', () => resolve(''));
  });
}

function parseCSVSnehasish(csv) {
  // Format: ID,URL,Title,Difficulty,Acceptance %,Frequency %
  const lines = csv.split('\n').map(l => l.trim()).filter(l => l);
  const questions = [];
  for (let i = 1; i < lines.length && questions.length < 75; i++) {
    const parts = lines[i].split(',');
    if (parts.length >= 5) {
      questions.push({
        id: parts[0],
        title: parts[2],
        acceptance: parts[4],
        difficulty: parts[3],
        url: parts[1]
      });
    }
  }
  return questions;
}

async function main() {
  // Load existing data
  const existingPath = './data/company-questions.json';
  let existing = {};
  if (fs.existsSync(existingPath)) {
    existing = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
    console.log(`Loaded ${Object.keys(existing).length} existing companies.`);
  }

  // Fetch directory listing of new repo
  console.log('Fetching repo 2 directory listing...');
  const contents = await fetchJSON('https://api.github.com/repos/snehasishroy/leetcode-companywise-interview-questions/contents');
  if (!contents) { console.error('Failed to fetch contents'); return; }

  const companies = contents.filter(c => c.type === 'dir').map(c => c.name);
  console.log(`Found ${companies.length} companies in repo 2.`);

  let added = 0, merged = 0;

  for (const company of companies) {
    const companyKey = company.toLowerCase().replace(/-/g, '_').replace(/\s+/g, '_');

    // Try six-months.csv first, then three-months.csv, then all.csv
    let csv = '';
    for (const file of ['six-months.csv', 'three-months.csv', 'all.csv']) {
      csv = await fetchText(
        `https://raw.githubusercontent.com/snehasishroy/leetcode-companywise-interview-questions/master/${company}/${file}`
      );
      if (csv && csv.includes(',')) break;
    }

    if (!csv) continue;

    const newQuestions = parseCSVSnehasish(csv);
    if (newQuestions.length === 0) continue;

    if (!existing[companyKey]) {
      // Brand new company
      existing[companyKey] = newQuestions;
      added++;
    } else {
      // Merge: add any questions that don't exist yet (by ID)
      const existingIds = new Set(existing[companyKey].map(q => q.id));
      const toAdd = newQuestions.filter(q => !existingIds.has(q.id));
      // Combine and cap at 75 total
      existing[companyKey] = [...existing[companyKey], ...toAdd].slice(0, 75);
      merged++;
    }

    process.stdout.write('.');
  }

  console.log(`\n\nAdded ${added} new companies, merged ${merged} existing companies.`);
  console.log(`Total companies now: ${Object.keys(existing).length}`);

  fs.writeFileSync(existingPath, JSON.stringify(existing));
  console.log('Saved to data/company-questions.json');
}

main();
