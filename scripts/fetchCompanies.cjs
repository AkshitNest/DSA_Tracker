const fs = require('fs');
const https = require('https');

async function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Node.js' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
        } else {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

async function fetchCSV(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Node.js' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) resolve(data);
        else resolve('');
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('Fetching repository contents...');
  const contents = await fetchJSON('https://api.github.com/repos/krishnadey30/LeetCode-Questions-CompanyWise/contents');
  if (!contents) {
    console.error('Failed to fetch repo contents (Rate limit or network error)');
    return;
  }

  // Extract unique company names
  const companySet = new Set();
  for (const file of contents) {
    if (file.name.endsWith('.csv')) {
      const parts = file.name.split('_');
      if (parts.length >= 2) {
        // e.g. amazon_6months.csv -> amazon
        companySet.add(parts[0]);
      }
    }
  }

  const companies = Array.from(companySet);
  console.log(`Found ${companies.length} companies. Downloading data...`);

  const result = {};
  
  // Download in small batches to avoid overwhelming the network
  for (const company of companies) {
    let csv = await fetchCSV(`https://raw.githubusercontent.com/krishnadey30/LeetCode-Questions-CompanyWise/master/${company}_6months.csv`);
    if (!csv) {
      csv = await fetchCSV(`https://raw.githubusercontent.com/krishnadey30/LeetCode-Questions-CompanyWise/master/${company}_1year.csv`);
    }
    if (!csv) {
      csv = await fetchCSV(`https://raw.githubusercontent.com/krishnadey30/LeetCode-Questions-CompanyWise/master/${company}_2year.csv`);
    }
    if (!csv) {
      csv = await fetchCSV(`https://raw.githubusercontent.com/krishnadey30/LeetCode-Questions-CompanyWise/master/${company}_alltime.csv`);
    }

    if (!csv) continue;
    
    // Parse CSV (ID, Title, Acceptance, Difficulty, Frequency)
    const lines = csv.split('\n').map(l => l.trim()).filter(l => l);
    const questions = [];
    
    for (let i = 1; i < lines.length && i <= 50; i++) { // Top 50 to keep file size reasonable
      const parts = lines[i].split(',');
      if (parts.length >= 4) {
        questions.push({
          id: parts[0],
          title: parts[1],
          acceptance: parts[2],
          difficulty: parts[3]
        });
      }
    }
    
    if (questions.length > 0) {
      result[company] = questions;
      process.stdout.write('.');
    }
  }
  
  console.log('\nProcessing complete.');
  
  if (!fs.existsSync('./data')) fs.mkdirSync('./data');
  fs.writeFileSync('./data/company-questions.json', JSON.stringify(result));
  console.log('Successfully saved to data/company-questions.json');
}

main();
