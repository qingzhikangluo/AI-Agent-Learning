const categories = [
  'Python',
  'API',
  'LLM',
  'Agent',
  'Debugging'
]

export function AssessmentPage() {
  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Assessment</p>
          <h1>Assessment</h1>
          <p className="page-sub">
            完成最小能力诊断，系统会给出推荐起点。
          </p>
        </div>
      </div>

      <section className="section">
        <h2 className="section-title">能力状态</h2>
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>能力</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category}>
                  <td>{category}</td>
                  <td>
                    <span className="status">
                      <span className="status-dot" aria-hidden="true" />
                      待评测
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
