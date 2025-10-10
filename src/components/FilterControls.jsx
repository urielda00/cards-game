import { useMemo } from 'react';
import styled from 'styled-components';

const FilterControlsWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const FilterButton = styled.button`
  padding: 0.6rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid ${props => props.$isActive ? '#007bff' : '#ccc'};
  border-radius: 20px;
  background-color: ${props => props.$isActive ? '#007bff' : '#ffffff'};
  color: ${props => props.$isActive ? 'white' : '#333'};
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${props => props.$isActive ? '#0056b3' : '#f8f9fa'};
    border-color: ${props => props.$isActive ? '#0056b3' : '#007bff'};
  }
`;

function FilterControls({ currentFilter, setFilter, cards = [] }) {
  const filterNames = {
    all: 'הכל',
    starred: 'מועדפים'
  };

  const filters = ['all', 'starred'];

  const counts = useMemo(() => {
    return {
      all: cards.length,
      starred: cards.filter(card => card.starred).length
    };
  }, [cards]);

  return (
    <FilterControlsWrapper>
      {filters.map(filterName => (
        <FilterButton
          key={filterName}
          $isActive={currentFilter === filterName}
          onClick={() => setFilter(filterName)}
        >
          {filterNames[filterName]} ({counts[filterName]})
        </FilterButton>
      ))}
    </FilterControlsWrapper>
  );
}

export default FilterControls;