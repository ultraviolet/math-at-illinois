import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import gpaLoader from "./scripts/gpa-loader.inline"

export default (() => {
  const GPAWidget: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    const course = fileData.frontmatter?.course
    
    if (!course) return null
    
    return (
      <details class="gpa-widget">
        <summary>📊 Course Statistics</summary>
        <div id="gpa-data" data-course={course}>
          loading... ^-^
        </div>
      </details>
    )
  }

  GPAWidget.afterDOMLoaded = gpaLoader

  // not certified web designer
  GPAWidget.css = `
  .gpa-widget {
    background: var(--lightgray);
    border-radius: 8px;
    padding: 0.5rem 1rem;
    margin: 1rem 0;
  }
  .gpa-widget summary {
    cursor: pointer;
    font-weight: 600;
    padding: 0.5rem 0;
  }
  .gpa-widget summary:hover {
    color: var(--secondary);
  }
  #gpa-data {
    padding-top: 0.5rem;
  }
  .gpa-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  .gpa-stat {
    background: var(--light);
    padding: 0.5rem;
    border-radius: 4px;
  }
  .gpa-stat-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--secondary);
  }
  `

  return GPAWidget
}) satisfies QuartzComponentConstructor