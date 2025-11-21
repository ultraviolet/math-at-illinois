const fs = require('fs');
const https = require('https');
const csv = require('csv-parser');

const GPA_URL = 'https://raw.githubusercontent.com/wadefagen/datasets/master/gpa/uiuc-gpa-dataset.csv';

function download() {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream('data/gpa-raw.csv');
    https.get(GPA_URL, res => {
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

function calculateGPA(row) {
  // as defined by UIUC
  // for some reason theres an average gpa in each term but not overall so i have to recalc?? what the shibal??
  const gradePoints = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.67,
    'B+': 3.33, 'B': 3.0, 'B-': 2.67,
    'C+': 2.33, 'C': 2.0, 'C-': 1.67,
    'D+': 1.33, 'D': 1.0, 'D-': 0.67, 'F': 0.0
  };
  
  let points = 0, students = 0;
  
  for (const [grade, value] of Object.entries(gradePoints)) {
    const count = parseInt(row[grade]) || 0;
    points += count * value;
    students += count;
  }
  
  return students > 0 ? (points / students).toFixed(2) : null;
}

async function process() {
  const courses = {};
  
  await new Promise(resolve => {
    fs.createReadStream('data/gpa-raw.csv')
      .pipe(csv())
      .on('data', row => {
        const id = `${row.Subject} ${row.Number}`;
        
        if (!courses[id]) {
          courses[id] = {
            subject: row.Subject,
            number: row.Number,
            title: row['Course Title'],
            semesters: []
          };
        }
        
        courses[id].semesters.push({
          year: row.Year,
          term: row.Term,
          gpa: calculateGPA(row),
          instructor: row['Primary Instructor'],
          students: row.Students
        });
      })
      .on('end', resolve);
  });
  
  // calc averages
  for (const course of Object.values(courses)) {
    const gpas = course.semesters.map(s => parseFloat(s.gpa)).filter(g => !isNaN(g));
    course.avgGPA = gpas.length ? (gpas.reduce((a, b) => a + b) / gpas.length).toFixed(3) : null;
  }

  // ok i think this is how quartz works?
  if (!fs.existsSync('quartz/static')) fs.mkdirSync('quartz/static', { recursive: true });
  fs.writeFileSync('quartz/static/gpa-processed.json', JSON.stringify(courses, null, 2));
}

(async () => {
  if (!fs.existsSync('data')) fs.mkdirSync('data');
  await download();
  await process();
  console.log('done');
})();