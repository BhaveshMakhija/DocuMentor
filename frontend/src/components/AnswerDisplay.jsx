import React from 'react';

const AnswerDisplay = ({ answer, citations }) => {
    return (
        <div className="answer-display">
            <h3>Answer</h3>
            <p>{answer || "No answer yet."}</p>
            
            {citations && citations.length > 0 && (
                <div className="citations">
                    <h4>Citations:</h4>
                    <ul>
                        {citations.map((c, idx) => (
                            <li key={idx}>[{c.source}] - {c.content.substring(0, 100)}...</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AnswerDisplay;
