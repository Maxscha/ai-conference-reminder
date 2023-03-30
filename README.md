# AI Conference Reminder
AI Conference Reminder is a GitHub Action that sends weekly reminders for upcoming AI conferences into a Slack channel. The action reads the conference information from a conferences.json file and filters out the conferences whose submission deadlines have already passed. Then, it sends a message to the specified Slack channel containing the upcoming conferences, their deadlines, and the remaining days.

## Features
- Automatically sends weekly reminders of upcoming AI conferences
- Filters out conferences with past submission deadlines
- Provides conference details, deadlines, and remaining days

## Prerequisites
To use this action, you will need:

- A Slack workspace
- A Slack User OAuth Access Token with the chat:write scope
- A Slack Channel ID where the reminders will be sent