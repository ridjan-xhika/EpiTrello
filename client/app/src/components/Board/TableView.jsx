import React, { useState } from 'react';
import '../../styles/board-views.css';

const TableView = ({ board, onCardClick, userRole }) => {
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');

  const canWrite = userRole !== 'read';

  // Flatten all cards with their column info
  const allCards = board.columns.flatMap(column =>
    (column.cards || []).map(card => ({
      ...card,
      columnName: column.title,
      columnId: column.id
    }))
  );

  // Sorting logic
  const sortedCards = [...allCards].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'column':
        comparison = a.columnName.localeCompare(b.columnName);
        break;
      case 'due_date':
        const dateA = a.due_date ? new Date(a.due_date) : new Date('9999-12-31');
        const dateB = b.due_date ? new Date(b.due_date) : new Date('9999-12-31');
        comparison = dateA - dateB;
        break;
      case 'created':
        comparison = new Date(a.created_at) - new Date(b.created_at);
        break;
      default:
        comparison = 0;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return <span className="sort-icon">⇅</span>;
    return <span className="sort-icon">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="table-view">
      <div className="table-container">
        <table className="cards-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('title')} className="sortable">
                Card Title <SortIcon column="title" />
              </th>
              <th onClick={() => handleSort('column')} className="sortable">
                List <SortIcon column="column" />
              </th>
              <th>Labels</th>
              <th onClick={() => handleSort('due_date')} className="sortable">
                Due Date <SortIcon column="due_date" />
              </th>
              <th onClick={() => handleSort('created')} className="sortable">
                Created <SortIcon column="created" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedCards.length === 0 ? (
              <tr>
                <td colSpan="5" className="table-empty">
                  No cards found
                </td>
              </tr>
            ) : (
              sortedCards.map(card => (
                <tr
                  key={card.id}
                  className="table-row"
                  onClick={() => onCardClick(card)}
                >
                  <td className="table-cell-title">
                    <div className="table-card-title">{card.title}</div>
                    {card.description && (
                      <div className="table-card-description">
                        {card.description.substring(0, 80)}
                        {card.description.length > 80 ? '...' : ''}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="table-column-badge">{card.columnName}</span>
                  </td>
                  <td>
                    {card.labels && card.labels.length > 0 ? (
                      <div className="table-labels">
                        {card.labels.slice(0, 2).map((label, idx) => (
                          <span
                            key={idx}
                            className="table-label"
                            style={{ backgroundColor: label.color }}
                          >
                            {label.name}
                          </span>
                        ))}
                        {card.labels.length > 2 && (
                          <span className="table-label-more">
                            +{card.labels.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    {card.due_date ? (
                      <span className={`table-due-date ${isOverdue(card.due_date) ? 'overdue' : ''}`}>
                        {formatDate(card.due_date)}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="table-cell-muted">
                    {formatDate(card.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="table-summary">
        <span>Total Cards: {allCards.length}</span>
        <span>•</span>
        <span>Lists: {board.columns.length}</span>
      </div>
    </div>
  );
};

export default TableView;
