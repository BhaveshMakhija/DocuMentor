import React from 'react';
const AnswerDisplay = ({ answer, citations }) => {
    if (!answer) return null;
    return (
        <section className="glass-panel answer-section">
            <div className="answer-text"><strong>Answer:</strong><p>{answer}</p></div>
            {citations?.length > 0 && (
                <div className="citations-list">
                    <h3>Sources</h3>
                    {citations.map((c, i) => (
                        <div key={i} className="citation-card">
                            <div className="citation-source">[{c.doc_id.substring(0,8)}] {c.source}</div>
                            <div className="citation-content">"{c.content.substring(0,100)}..."</div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};
export default AnswerDisplay;
