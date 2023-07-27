const yaml = require('js-yaml');
const fs = require('fs');
const axios = require('axios');

async function downloadFile(fileUrl, outputLocationPath) {
  const writer = fs.createWriteStream(outputLocationPath);

  return axios({
    method: 'get',
    url: fileUrl,
    responseType: 'stream',
  }).then((response) => new Promise((resolve, reject) => {
    response.data.pipe(writer);
    let error = null;
    writer.on('error', (err) => {
      error = err;
      writer.close();
      reject(err);
    });

    writer.on('close', () => {
      if (!error) {
        resolve(true);
      }
    });
  }));
}

function loadYaml(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return yaml.load(content);
}

function filterConferences(conferences, excludedConferences) {
  return conferences
    .filter((item) => !['RO', 'CG', 'KR', 'AP'].includes(item.sub))
    .filter((item) => !excludedConferences.includes(item.title));
}

function mapConferences(conferences) {
  return conferences.map((item) => {
    const startDate = item.start instanceof Date ? item.start.toISOString().split('T')[0] : item.start || '';
    const endDate = item.end instanceof Date ? item.end.toISOString().split('T')[0] : item.end || '';
    return {
      title: item.title,
      id: item.id,
      full_name: item.full_name || '',
      link: item.link || '',
      year: item.year || '',
      deadline: item.deadline || '',
      timezone: item.timezone || '',
      date: item.date || '',
      start: startDate,
      end: endDate,
      location: item.place || '',
      hindex: item.hindex || 0,
      field: item.field || '',
      type: 'conference',
      notes: item.note || '',
    };
  });
}

function writeToFile(path, data) {
  const jsonContent = JSON.stringify(data, null, 2);
  fs.writeFileSync(path, jsonContent);
}

async function downloadAndParseFile(
  conferencesPath,
  additionalConferencesPath,
  excludedConferencesPath,
  outputLocationPath,
) {
  try {
    const downloadResult = await downloadFile(
      'https://raw.githubusercontent.com/paperswithcode/ai-deadlines/gh-pages/_data/conferences.yml',
      conferencesPath,
    );

    if (!downloadResult) {
      // console.log('Error while downloading file');
      return;
    }

    // console.log('File downloaded successfully');

    const parsedConferences = loadYaml(conferencesPath);
    const additionalConferences = loadYaml(additionalConferencesPath);
    const combinedConferences = [...parsedConferences, ...additionalConferences];

    const excludedConferences = loadYaml(excludedConferencesPath);

    const filteredConferences = filterConferences(combinedConferences, excludedConferences);

    const conferences = mapConferences(filteredConferences);

    writeToFile(outputLocationPath, conferences);

    // console.log('File parsed successfully');
  } catch (error) {
    // console.error(`Error while downloading and parsing file: ${error}`);
  }
}

module.exports = downloadAndParseFile;
