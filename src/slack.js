const https = require('https');

const getOptions = (method, token, path) => ({
  hostname: 'slack.com',
  port: 443,
  path,
  method,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    Authorization: `Bearer ${token}`,
  },
});

function request(method, token, path, message) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(message);

    const options = getOptions(method, token, path);

    const req = https.request(options, (res) => {
      const chunks = [];

      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          result: Buffer.concat(chunks).toString(),
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(payload);
    req.end();
  });
}

async function postMessage(token, message) {
  const response = await request('POST', token, '/api/chat.postMessage', message);
  const result = JSON.parse(response.result);

  if (!result || !result.ok || response.statusCode !== 200) {
    throw new Error(`Error! ${JSON.stringify(response)}`);
  }

  return response;
}

async function getChannelsFromUser(token) {
  const channelList = [];
  let nextToken = '';
  /* eslint-disable no-await-in-loop */
  do {
    const response = await request('GET', token, `/api/conversations.list?types=public_channel,private_channel&cursor=${nextToken}`, {});
    nextToken = '';
    if (response.statusCode === 200) {
      const parsedBody = JSON.parse(response.result);
      channelList.push(...parsedBody.channels);
      nextToken = parsedBody.response_metadata.next_cursor;
    }
  } while (nextToken.length > 1);
  /* eslint-enable no-await-in-loop */

  return channelList;
}

module.exports = { postMessage, getChannelsFromUser };
