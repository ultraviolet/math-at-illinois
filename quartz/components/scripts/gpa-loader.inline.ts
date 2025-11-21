document.addEventListener("nav", async () => {
  const gpaEl = document.getElementById("gpa-data")
  if (!gpaEl) return
  
  const course = gpaEl.dataset.course
  if (!course) return
  
  try {
    const response = await fetch('/static/gpa-processed.json')
    const data = await response.json()
    const courseData = data[course]
    
    // unfortunately this doesnt handle class reskins very well, inherent weakness with the data is that e.g. ECE374 == CS374
    // but the data does not have duplicate so you have to use whatever name is the "official" course
    if (!courseData) {
      gpaEl.innerHTML = `<p>GPA data unavailable for ${course} :(</p>`
      return
    }
    
    const recentSemesters = courseData.semesters.slice(0, 5)
    
    gpaEl.innerHTML = `
      <div class="gpa-stats">
        <div class="gpa-stat">
          <div class="gpa-stat-label">Average GPA</div>
          <div class="gpa-stat-value">${courseData.avgGPA}</div>
        </div>
        <div class="gpa-stat">
          <div class="gpa-stat-label">Total Sections</div>
          <div class="gpa-stat-value">${courseData.semesters.length}</div>
        </div>
      </div>
      <details style="margin-top: 1rem;">
        <summary>Recent Semesters</summary>
        <table style="width: 100%; margin-top: 0.5rem;">
          <thead>
            <tr>
              <th>Term</th>
              <th>GPA</th>
              <th>Instructor</th>
            </tr>
          </thead>
          <tbody>
            ${recentSemesters.map((s: any) => `
              <tr>
                <td>${s.term} ${s.year}</td>
                <td>${s.gpa}</td>
                <td>${s.instructor}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </details>
    `
  } catch (e) {
    gpaEl.innerHTML = '<p>An error occurred whilst loading GPA data :(</p>'
  }
})