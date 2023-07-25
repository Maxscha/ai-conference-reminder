const core = require('@actions/core');
const fs = require('fs').promises;
const { DateTime } = require('luxon');
const slack = require('./src/slack');

async function main() {
  try {
    const messageFilePath = 'data/conferences.json';
    const rawdata = await fs.readFile(messageFilePath, 'utf-8');
    let conferences = JSON.parse(rawdata);

    const userToken = core.getInput('slack-user-oauth-access-token');
    const channelId = core.getInput('slack-channel');

    const now = DateTime.now('Europe/Berlin');

    conferences = conferences
      .map((conference) => {
        const dt = DateTime.fromISO(conference.deadline.replace(' ', 'T'), { zone: conference.timezone });
        return dt.isValid ? { ...conference, deadline: dt } : null;
      })
      .filter((conference) => conference && conference.deadline.ts > now.ts);

    conferences.sort((a, b) => a.deadline - b.deadline);

    let text = 'Hey everyone, \nhere is your weekly reminder for upcoming AI-conferences:\n\n';

    for (const conference of conferences) {
      const deadlineDateTime = DateTime.fromISO(conference.deadline, { zone: conference.timezone });
      const diffInMilliseconds = deadlineDateTime.diff(now);
      const days = Math.ceil(diffInMilliseconds.as('days'));
      const deadline = deadlineDateTime.toLocaleString(DateTime.DATE_FULL);

      text += `<${conference.link}|*${conference.title} ${conference.year}*> ${deadline} in *${days}* days in ${conference.location}.\n\n`;
    }
    text += 'Feel free to add your own conferences to the repository: https://github.com/Maxscha/ai-conference-reminder';

    await slack.postMessage(userToken, { channel: channelId, text });
  } catch (error) {
    core.setFailed(`Error during execution: ${error}`);
    console.error(error);
  }
}

main();
