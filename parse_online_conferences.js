const axios = require('axios');
const yaml = require('js-yaml');
const { DateTime } = require('luxon');
const fs = require('fs');

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
  const url = 'https://raw.githubusercontent.com/paperswithcode/ai-deadlines/gh-pages/_data/conferences.yml';
  let conferenceData = [];
  try {
    const yamlContent = await downloadYamlFile(url);
    conferenceData = parseYaml(yamlContent);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }

  const goodConferenceData = [];
  for (const conference of conferenceData) {
    // accept only sub ML, NLP, and CV
    if (!['ML', 'NLP', 'CV'].some((topic) => conference.sub.includes(topic))) {
      continue;
    }

    if (conference.deadline == null) {
      continue;
    }

    // accept only conferences with a deadline in the future
    const deadline = parseDateWithTimezone(conference.deadline, conference.timezone);
    const now = DateTime.now();
    if (!deadline.isValid || deadline < now) {
      continue;
    }

    if (conferenceDenyList.includes(conference.title)) {
      continue;
    }

    const manuallyAddedConferences = await readJSONFile('./conferences.json');
    const alreadyManuallyAdded = manuallyAddedConferences.some((manualConference) => manualConference.shortcut.toLowerCase().includes(conference.title.toLowerCase()));
    if (alreadyManuallyAdded) continue;

    const conferenceObject = {
      name: `${conference.title} ${conference.year}`,
      shortcut: conference.title,
      location: conference.place,
      deadline: deadline.toISO(),
      url: conference.link,
      abstractDeadline: conference.abstract_deadline ? parseDateWithTimezone(conference.abstract_deadline, conference.timezone).toISO() : null,
      note: conference.note,
      conferenceTime: conference.date,
    };
    console.log(conference.deadline, conference.timezone);
    console.log(conferenceObject);
    goodConferenceData.push(conferenceObject);
  }

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
