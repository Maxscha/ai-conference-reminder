const axios = require('axios');
const yaml = require('js-yaml');
const { DateTime } = require('luxon');
const fs = require('fs');
const { exit } = require('process');

function parseDateWithTimezone(inputDate, timezone) {
  return DateTime.fromFormat(inputDate, 'yyyy-MM-dd HH:mm:ss', { zone: timezone });
}

async function downloadYamlFile(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to download the file: ${error.message}`);
  }
}

function parseYaml(yamlContent) {
  try {
    const data = yaml.load(yamlContent);
    return data;
  } catch (error) {
    throw new Error(`Failed to parse the YAML file: ${error.message}`);
  }
}

async function readJSONFile(filePath) {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    const jsonObject = JSON.parse(data);
    return jsonObject;
  } catch (error) {
    throw error;
  }
}

const conferenceDenyList = [
  'ICRA',
  'AAMAS',
  'RecSys',
  'ACML',
  'SIGIR-AP',
  'SIGGRAPH Asia',
  'CoRL',
  'RO-MAN',
  'AutoML-Conf',
  'CoLLAs',
  'UAI',
  'RSS',
  'IROS',
  'KR',
  'ICAPS',
  'AISTATS',
  'ACML',
  'ICMI',
  'ISMIR',
  'ALT',
  'HRI',
  'COLT',
  'ICCC',
  'ICPR',
  '3DV',
  'ICME',
  'ICIP',
  'MIDL',
  'FG',
  'CHIL',
];

(async () => {
  const folder = 'ccf-deadlines/conference/AI'
  const files = fs.readdirSync(folder).filter((file) => file.endsWith('.yml'));

  let conferenceData = [];

  for (const file of files) {
    const filePath = `${folder}/${file}`;
    const yamlContent = fs.readFileSync(filePath, 'utf8');
    data = parseYaml(yamlContent)[0];
    data.confs.sort((a, b) => a.year - b.year);
    data.conference = data.confs[data.confs.length - 1];
    data.deadline = null;
    data.abstract_deadline = null;
    conferenceData.push(data);

  }

  const goodConferenceData = [];
  for (const conference of conferenceData) {
    // TODO Incooperate multiple deadlines if available
    last_deadline = conference.conference.timeline[conference.conference.timeline.length - 1];

    // accept only conferences with a deadline in the future
    const deadline = parseDateWithTimezone(last_deadline.deadline, conference.conference.timezone);
    const now = DateTime.now();
    if (!deadline.isValid || deadline < now) {
      continue;
    }

    if (conferenceDenyList.includes(conference.title)) {
      continue;
    }

    let abstract_deadline = null;

    if ("abstract_deadline" in last_deadline) {
      abstract_deadline = parseDateWithTimezone(last_deadline.abstract_deadline, conference.conference.timezone);
    }

    const manuallyAddedConferences = await readJSONFile('./conferences.json');
    const alreadyManuallyAdded = manuallyAddedConferences.some((manualConference) => manualConference.shortcut.toLowerCase().includes(conference.title.toLowerCase()));
    if (alreadyManuallyAdded) continue;

    const conferenceObject = {
      name: `${conference.title} ${conference.conference.year}`,
      shortcut: conference.title,
      location: conference.conference.place,
      deadline: deadline.toISO(),
      url: conference.conference.link,
      abstractDeadline: abstract_deadline ? abstract_deadline : null,
      note: "",
      conferenceTime: conference.conference.date,
    };
    goodConferenceData.push(conferenceObject);
  }
  console.log("Number of good conferences: ", goodConferenceData.length);
  // Convert the JSON array to a string
  // The second argument (null) is a replacer function, and the third argument (4) is the number of spaces to use for indentation.
  const jsonString = JSON.stringify(goodConferenceData, null, 4);

  // File path
  const filePath = './parsed_conferences.json';

  // Write the JSON string to a file
  fs.writeFile(filePath, jsonString, 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
    } else {
      console.log('JSON array successfully written to file:', filePath);
    }
  });
})();
