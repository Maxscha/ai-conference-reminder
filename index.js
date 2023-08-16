const core = require('@actions/core');
const fs = require('fs');
const slack = require('./src/slack');

function daysUntilNow(date) {
  const now = new Date();
  const diffTime = date - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

async function main() {
  try {
    // TODO Make this readable also for multiple conferences
    const messageFilePath = 'conferences.json';
    const rawdata = fs.readFileSync(messageFilePath);
    let conferences = JSON.parse(rawdata);

    const autoParsedConferencesPath = 'parsed_conferences.json';
    const autoParsedConferencesData = fs.readFileSync(autoParsedConferencesPath);
    let autoParsedConferences = JSON.parse(autoParsedConferencesData);

    conferences = conferences.concat(autoParsedConferences);

    for (const conference of conferences) {
      conference.deadline = new Date(conference.deadline);
    }
    const userToken = core.getInput('slack-user-oauth-access-token');
    const channelId = core.getInput('slack-channel');
    const gitRepository  = core.getInput('git-repository')

    const now = new Date();
    conferences.sort((a, b) => b.deadline - a.deadline);

    conferences = conferences.reverse();

    // Filter out messages where the submission deadline is in the past
    conferences = conferences.filter((conference) => conference.deadline > now);

    let text = 'Hey everyone, \nhere is your weekly reminder for upcoming AI-conferences:\n\n';

    for (const conference of conferences) {
      const deadline = conference.deadline.toLocaleDateString('en-en', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      let conferenceName = conference.url ? `<${conference.url}|*${conference.name}*>` : `*${conference.name}*`;
      text += `${conferenceName} ${deadline} in *${daysUntilNow(conference.deadline)}* days in ${conference.location}`;

      if (conference.abstractDeadline) {
        text += ` (Abstract deadline in ${daysUntilNow(new Date(conference.abstractDeadline))} days)`;
      }

      if (conference.note) {
        text += `\n(${conference.note})`;
      }

      text += '\n\n';
    }

    text += `Feel free to add your own conferences to the repository: ${gitRepository}`;

    await slack.postMessage(userToken, { channel: channelId, text });
  } catch (error) {
    core.setFailed(error);
  }
}

main();
