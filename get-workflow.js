const https = require('https');
const config = require('./config');

// Charger et valider la configuration
config.validate();

const options = {
  hostname: config.n8n.apiUrl.replace('https://', ''),
  port: 443,
  path: `/api/v1/workflows/${config.workflows.masterId}`,
  method: 'GET',
  headers: {
    'X-N8N-API-KEY': config.n8n.apiKey
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => {
    if (res.statusCode === 200) {
      const workflow = JSON.parse(body);
      console.log(JSON.stringify(workflow, null, 2));
    } else {
      console.error('Error:', res.statusCode, body);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.end();
