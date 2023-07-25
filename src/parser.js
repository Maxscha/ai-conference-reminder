// eslint-disable-next-line import/no-extraneous-dependencies
const yaml = require('js-yaml');
const fs = require('fs');

try {
  const fileContent = fs.readFileSync('../data/conferences.yml', 'utf8');
  const document = yaml.load(fileContent);

  const conferences = document
    .filter((item) => !['RO', 'CG', 'KR', 'AP'].includes(item.sub))
    .map((item) => {
      const startDate = item.start instanceof Date
        ? item.start.toISOString().split('T')[0]
        : item.start || '';
      const endDate = item.end instanceof Date
        ? item.end.toISOString().split('T')[0]
        : item.end || '';
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

  const jsonContent = JSON.stringify(conferences, null, 2);
  fs.writeFileSync('../data/conferences.json', jsonContent);
} catch (error) {
  console.error(error);
}
