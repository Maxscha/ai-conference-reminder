const core = require("@actions/core");
const github = require("@actions/github");
const slack = require("./src/slack");

const fs = require('fs');

function Sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
 }

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

    // Filter out messages which are in the past
    conferences = conferences.filter(function(conference) {
        return conference.deadline > now;
    });


    text = "Hey, here your weekly reminder for the next upcoming AI-conferenes:\n";

    for (let conference of conferences) {
        // const deadline = conference.deadline.toLocaleDateString("de-DE");
        const days = Math.ceil((conference.deadline - now) / (1000 * 60 * 60 * 24));


        text += conference.name + " " + conference.deadline + "in " +days +  "\n";
    }

    text += "Feel free to add your own conferences to the list: https://github.com/Maxscha/ai-conference-reminder \n"



    slack.postMessage(userToken, {"channel": "C04MCHG1P5Y", "text": text});
    
    for (let conference of conferences) {
        // 
    }


    // const allMessages = buildRepeatMessages(messages);

    // setup.deleteAllScheduledMessages(userTokens);

    // const results = [];

    // for (let message of allMessages) {
    //   const user = message.user || "default";
    //   const channels = userChannels[user];
    //   const token = userTokens[user];
    //   const messageBuilded = buildMessage(
    //     convertChannelNameToId(message.channel, channels),
    //     message.text,
    //     message.post_at
    //   );
    //   const result = slack.sendMessage(token, messageBuilded);
    //   result.catch((error) => {
    //     console.error(`${error} for mesage: \n ${message.text}`);
    //   });
    //   results.push(result);
    //   await Sleep(1000)

      //TODO put in proper error handling
    // }
    // TODO Output scheduled messages

    // for (let result of results) {
    //   try {
    //     let r = await result;
    //     console.log(r);
    //   } catch (error) {
    //     // console.error(error);
    //   }
    // }
    await Sleep(1000)
  } catch (error) {
    core.setFailed(error);
  }
}

main();