const core = require("@actions/core");
const github = require("@actions/github");
const slack = require("./src/slack");

const fs = require('fs');


 

async function main() {
  //TODO make proper async
  try {
    const messageFilePath = 'conferences.json'
    
    let rawdata = fs.readFileSync(messageFilePath);
    let conferences = JSON.parse(rawdata);
    
    for (let conference of conferences) {
        conference.deadline = new Date(conference.deadline);
    }
    const userToken = core.getInput("slack-user-oauth-access-token")

    const now = new Date();
    conferences.sort(function(a, b) {
        return b.deadline - a.deadline;
    });

    conferences = conferences.reverse();

    // Filter out messages which are in the past
    conferences = conferences.filter(function(conference) {
        return conference.deadline > now;
    });


    text = "Hey everyone, \nhere is your weekly reminder for upcoming AI-conferences:\n\n";

    for (let conference of conferences) {
        // const deadline = conference.deadline.toLocaleDateString("de-DE");
        
        const days = Math.ceil((conference.deadline - now) / (1000 * 60 * 60 * 24));

        //format date nicely
        const deadline = conference.deadline.toLocaleDateString("en-en", {year: 'numeric', month: 'long', day: 'numeric'});
        
        text += `<${conference.url}|*${conference.name}*> ${deadline} in ${days} days\n\n`
    }

    // text += "Feel free to add your own conferences to the list: https://github.com/Maxscha/ai-conference-reminder \n"



    await slack.postMessage(userToken, {"channel": "C01EZJGU0LQ", "text": text});
    
  } catch (error) {
    core.setFailed(error);
  }
}

main();