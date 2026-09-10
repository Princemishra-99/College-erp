2222require('dotenv').config();
cons2t axios = require('axios');

const k = process.env.SARVAM_API_KEY;
console.log('Key:', k ? k.slice(0, 12) + '...' : 'MISSING');

async function main() {
  try {
    const response = await axios.post(
      'https://api.sarvam.ai/v1/chat/completions',
      {
        model: 'sarvam-105b-conversations',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'What is the 75% attendance rule?' }
        ],
        max_tokens: 100
      },
      {
        headers: {
          'api-subscription-key': k,
          'Content-Type': 'application/json'
        },
        timeout: 25000
      }
    );
    console.log('SUCCESS!');
    console.log(response.data.choices[0].message.content);
  } catch (err) {
    console.error('ERROR:', err.response ? err.response.status + ' - ' + JSON.stringify(err.response.data) : err.message);
  }
}

main();
