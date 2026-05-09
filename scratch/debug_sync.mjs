
async function testSync() {
  const handles = {
    leetcode: 'akshit07_56',
    codeforces: 'sharmaakshit495',
    codechef: 'sharmaakshit07',
    gfg: 'sharmaakshit495',
    codingninjas: ''
  };

  console.log('Testing Sync for handles:', handles);

  // We'll simulate the internal API calls
  try {
    // Test Codeforces API directly
    const cfRes = await fetch(`https://codeforces.com/api/user.info?handles=${handles.codeforces}`);
    const cfData = await cfRes.json();
    console.log('CF Info API:', cfData.status);

    const cfStatusRes = await fetch(`https://codeforces.com/api/user.status?handle=${handles.codeforces}`);
    const cfStatusData = await cfStatusRes.json();
    console.log('CF Status API result count:', cfStatusData.result?.length || 0);

    // Test GFG (using our proxy logic but direct fetch)
    const gfgRes = await fetch(`https://www.geeksforgeeks.org/user/${handles.gfg}/`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    console.log('GFG Response OK:', gfgRes.ok);
    const gfgHtml = await gfgRes.text();
    console.log('GFG HTML length:', gfgHtml.length);
    const scoreMatch = gfgHtml.match(/\"score\":(\d+)/);
    console.log('GFG Score found in script:', scoreMatch ? scoreMatch[1] : 'Not found');

  } catch (e) {
    console.error('Test failed:', e);
  }
}

testSync();
