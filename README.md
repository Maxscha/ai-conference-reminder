# AI Conference Reminder
AI Conference Reminder is a GitHub Action that sends weekly reminders for upcoming AI conferences into a Slack channel. The action reads the conference information from a conferences.json file and filters out the conferences whose submission deadlines have already passed. Then, it sends a message to the specified Slack channel containing the upcoming conferences, their deadlines, and the remaining days.

## Features
- Automatically sends weekly reminders of upcoming AI conferences
- Filters out conferences with past submission deadlines
- Provides conference details, deadlines, and remaining days

## Prerequisites
To use this action, you will need:

- :heavy_exclamation_mark: A Slack workspace. 
- :heavy_exclamation_mark: A Slack user OAuth access token with the `chat:write' scope. It can be created using the [Slack API](https://api.slack.com/apps).
- :heavy_exclamation_mark: A Slack channel ID to which the reminders will be sent. The ID can be found in the channel details within Slack. Note that the created Slack app must be manually added to the channel.
- :hammer_and_wrench: An optional Slack channel ID to send debug messages to when testing the action.

The action uses the following secrets:
 
| Description                                                       | Secret                        | Example                                                   |
|-------------------------------------------------------------------|-------------------------------|-----------------------------------------------------------|
| :heavy_exclamation_mark: Slack user OAuth access token (Required) | SLACK_USER_OAUTH_ACCESS_TOKEN | xoxb-6132114261569-1921537423623-naMskL2MsmaEbafU1sJm63mA | 
| :heavy_exclamation_mark: Slack reminder channel ID (Required)     | SLACK_REMINDER_CHANNEL_ID     | C051V32G410                                               |
| :hammer_and_wrench: Slack debug channel ID (Optional)             | SLACK_DEBUG_CHANNEL_ID        | C021A32G420                                               |
