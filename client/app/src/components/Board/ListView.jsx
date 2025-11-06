import React from 'react';
import '../../styles/board-views.css';

const ListView = ({ board, onCardClick, userRole }) => {
  const canWrite = userRole !== 'read';

  // Flatten all cards from all columns
  const allCards = board.columns.flatMap(column => 
    (column.cards || []).map(card => ({
      ...card,
      columnName: column.title,
      columnId: column.id
    }))
  );

  // Group by column
  const cardsByColumn = board.columns.map(column => ({
    ...column,
    cards: allCards.filter(card => card.columnId === column.id)
  }));

  return (
    <div className="list-view">
      {cardsByColumn.map(column => (
        <div key={column.id} className="list-column-section">
          <div className="list-column-header">
            <h3>{column.title}</h3>
            <span className="list-card-count">{column.cards.length}</span>
          </div>
          
          {column.cards.length === 0 ? (
            <div className="list-empty-state">No cards in this column</div>
          ) : (
            <div className="list-cards">
              {column.cards.map(card => (
                <div
                  key={card.id}
                  className="list-card"
                  onClick={() => onCardClick(card)}
                >
                  <div className="list-card-content">
                    <h4 className="list-card-title">{card.title}</h4>
                    {card.description && (
                      <p className="list-card-description">{card.description}</p>
                    )}
                  </div>
                  
                  <div className="list-card-meta">
                    {card.due_date && (
                      <span className="list-card-due">
                        📅 {new Date(card.due_date).toLocaleDateString()}
                      </span>
                    )}
                    {card.labels && card.labels.length > 0 && (
                      <div className="list-card-labels">
                        {card.labels.slice(0, 3).map((label, idx) => (
                          <span
                            key={idx}
                            className="list-card-label"
                            style={{ backgroundColor: label.color }}
                          >
                            {label.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ListView;
