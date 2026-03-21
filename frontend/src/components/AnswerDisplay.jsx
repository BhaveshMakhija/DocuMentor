import React from 'react';

const AnswerDisplay = ({ answer, citations }) => {
    if (!answer) return null;

    return (
        <section className="glass-panel answer-section">
            <div className="answer-text">
                <strong>Answer:</strong>
                <p>{answer}</p>
            </div>
            
            {citations && citations.length > 0 && (
                <div className="citations-list">
                    <h3>Sources Referenced</h3>
                    {citations.map((c, idx) => (
                        <div key={idx} className="citation-card">
                            <div className="citation-source">
                                [{c.doc_id.substring(0, 8)}...] {c.source}
                                {c.score != null && ` (Relevance: ${c.score.toFixed(2)})`}
                            </div>
                            <div className="citation-content">
                                "{c.content.substring(0, 200)}..."
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default AnswerDisplay;
