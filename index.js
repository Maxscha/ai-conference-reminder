const fs = require('fs');
const core = require('@actions/core');
const { DateTime } = require('luxon');
const slack = require('./src/slack');
const downloadAndParseFile = require('./src/parser');

const createDirIfNotExist = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};

const mapConferences = (conferences, now) => conferences
  .map((conference) => {
    const dt = DateTime.fromISO(conference.deadline.replace(' ', 'T'), { zone: conference.timezone });
    return dt.isValid ? { ...conference, deadline: dt } : null;
  })
  .filter((conference) => conference && conference.deadline.ts > now.ts)
  .sort((a, b) => a.deadline - b.deadline);

const composeMessage = (conferences, now) => {
  let text = 'Hey everyone, \nhere is your weekly reminder for upcoming AI-conferences:\n\n';

  for (const conference of conferences) {
    const deadlineDateTime = DateTime.fromISO(conference.deadline, { zone: conference.timezone });
    const diffInMilliseconds = deadlineDateTime.diff(now);
    const days = Math.ceil(diffInMilliseconds.as('days'));
    const deadline = deadlineDateTime.toLocaleString(DateTime.DATE_FULL);

    text += `<${conference.link}|*${conference.title} ${conference.year}*> ${deadline} in *${days}* days in ${conference.location}.\n\n`;
  }
  text += 'Feel free to add your own conferences to the repository: https://github.com/Maxscha/ai-conference-reminder';
  return text;
};

async function main() {
  try {
    const dataDir = 'data';
    const outputLocationPath = `${dataDir}/conferences.yml`;
    const additionalConferencesPath = `${dataDir}/additional-conferences.yml`;
    const excludedConferencesPath = `${dataDir}/conference-exclusions.yml`;
    const parsedConferences = `${dataDir}/parsed-conferences.json`;

    createDirIfNotExist(dataDir);

    await downloadAndParseFile(
      outputLocationPath,
      additionalConferencesPath,
      excludedConferencesPath,
      parsedConferences,
    );

    let conferences = JSON.parse(fs.readFileSync(parsedConferences, 'utf8'));

    const userToken = core.getInput('slack-user-oauth-access-token');
    const channelId = core.getInput('slack-channel');

    const now = DateTime.now('Europe/Berlin');

    conferences = mapConferences(conferences, now);

    const text = composeMessage(conferences, now);

    // console.log(text);
    await slack.postMessage(userToken, { channel: channelId, text });
  } catch (error) {
    core.setFailed(`Error during execution: ${error}`);
    // console.error(error);
  }
}

main();
