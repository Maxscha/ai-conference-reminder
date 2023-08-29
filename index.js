const core = require('@actions/core');
const fs = require('fs');
const slack = require('./src/slack');

function daysUntilNow(date) {
  const now = new Date();
  const diffTime = date - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function convertLinksToSlackFormat(text) {
  // Regular expression to match <a> format
  /*
  <a: Matches the literal characters <a.
  \s+: Matches one or more whitespace characters (spaces, tabs, line breaks).
  href=["']: Matches the attribute href= followed by either a single or double quote character.
  ([^"']+): Capturing group for URL, any character except quotes, one or more times.
  ["']: Matches the closing quote character for href.
  \s*>: Matches remaining whitespace and the closing angle bracket >.
  (.*?): Capturing group for link text, any character, zero or more times.
  <\/a>: Matches literal characters </a>, the closing tag.
  /g: Global flag for all occurrences in the input.
  /i: Case-insensitive flag.
  */
  const regex = /<a\s+href=["']([^"']+)["']\s*>(.*?)<\/a>/gi;

  // Replace <a> format with Slack format. Sanitizes link text.
  const slackText = text.replace(regex, (_, url, name) => `<${url}|*${name.replace(/[*_~]/g, '\\$&')}*>`);
  return slackText;
}

async function main() {
  try {
    // TODO Make this readable also for multiple conferences
    const messageFilePath = 'conferences.json';
    const rawdata = fs.readFileSync(messageFilePath);
    let conferences = JSON.parse(rawdata);

    const autoParsedConferencesPath = 'parsed_conferences.json';
    const autoParsedConferencesData = fs.readFileSync(autoParsedConferencesPath);
    const autoParsedConferences = JSON.parse(autoParsedConferencesData);

    conferences = conferences.concat(autoParsedConferences);

    for (const conference of conferences) {
      conference.deadline = new Date(conference.deadline);
    }
    const userToken = core.getInput('slack-user-oauth-access-token');
    const channelId = core.getInput('slack-channel');

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

      const conferenceName = conference.url ? `<${conference.url}|*${conference.name}*>` : `*${conference.name}*`;
      text += `${conferenceName} ${deadline} in *${daysUntilNow(conference.deadline)}* days in ${conference.location}`;

      if (conference.abstractDeadline) {
        text += ` (Abstract deadline in ${daysUntilNow(new Date(conference.abstractDeadline))} days)`;
      }

      if (conference.note) {
        text += `\n(${convertLinksToSlackFormat(conference.note)})`;
      }

      text += '\n\n';
    }

    text += 'Feel free to add your own conferences to the repository: https://github.com/Maxscha/ai-conference-reminder';
    console.log(text);
    await slack.postMessage(userToken, { channel: channelId, text });
  } catch (error) {
    core.setFailed(error);
  }
}

main();
