// run_diagnostic.js
// Usage: node run_diagnostic.js [baseUrl]
// Example: node run_diagnostic.js http://localhost:3000

const base = process.argv[2] || 'http://localhost:3000';

async function wait(ms){ return new Promise(r=>setTimeout(r, ms)); }

async function fetchWithRetry(url, opts = {}, retries = 10, delayMs = 500){
  for(let i=0;i<retries;i++){
    try{
      const res = await fetch(url, opts);
      return res;
    }catch(e){
      if(i === retries-1) throw e;
      await wait(delayMs);
    }
  }
}

(async ()=>{
  try{
    console.log('Diagnostic base URL:', base);

    // POST /api/login
    const loginUrl = new URL('/api/login', base).toString();
    console.log('\n1) POST', loginUrl);
    const body = { email: 'user@example.com', password: 'password123' };
    const loginRes = await fetchWithRetry(loginUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, 8, 500);
    console.log('  Status:', loginRes.status, 'OK:', loginRes.ok);
    let json;
    try{ json = await loginRes.json(); } catch(e){ json = { parseError: e.message }; }
    console.log('  Body:', JSON.stringify(json, null, 2));

    // GET /index.html
    const indexUrl = new URL('/index.html', base).toString();
    console.log('\n2) GET', indexUrl);
    const indexRes = await fetchWithRetry(indexUrl, {}, 6, 400);
    console.log('  Status:', indexRes.status, 'OK:', indexRes.ok);
    const indexText = await indexRes.text();
    console.log('  index.html length:', indexText.length);

    // GET /script.js (snippet)
    const scriptUrl = new URL('/script.js', base).toString();
    console.log('\n3) GET', scriptUrl);
    const scriptRes = await fetchWithRetry(scriptUrl, {}, 6, 400);
    console.log('  Status:', scriptRes.status, 'OK:', scriptRes.ok);
    const scriptText = await scriptRes.text();
    console.log('  script.js snippet (first 400 chars):\n');
    console.log(scriptText.slice(0,400));

    console.log('\nDIAGNOSTIC COMPLETE');
  }catch(err){
    console.error('\nERROR during diagnostic:', err.message);
    console.error(err.stack);
    process.exitCode = 2;
  }
})();
