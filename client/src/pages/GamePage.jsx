import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { CardProvider, useCards } from '../context/CardContext';
import styled from 'styled-components';
import GameDeck from '../components/GameDeck';
import AddWordForm from '../components/AddWordForm';
import FilterControls from '../components/FilterControls';
import Header from '../components/Header';

const PageWrapper = styled.div`
  padding: 2rem;

  @media (max-width: 600px) {
    padding: 1rem;
  }
`;

const EmptyStateContainer = styled.div`
  text-align: center;
  margin-top: 4rem;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;

  h2 {
    font-size: 1.8rem;
    color: #333;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1.1rem;
    color: #555;
  }
`;

function GamePageContent() {
  const { listId } = useParams();
  const { cards } = useCards();
  const [filter, setFilter] = useState('all');

  const filteredCards = useMemo(() => {
    if (filter === 'starred') {
      return cards.filter(card => card.starred);
    }
    return cards;
  }, [cards, filter]);

  const isListEmpty = cards.length === 0;

  return (
    <PageWrapper>
      <AddWordForm listId={listId} />
      
      {isListEmpty ? (
        <EmptyStateContainer>
          <h2>הרשימה הזו ריקה.</h2>
          <p>הוסף כמה מילים כדי להתחיל סשן לימוד!</p>
        </EmptyStateContainer>
      ) : (
        <>
          <FilterControls currentFilter={filter} setFilter={setFilter} cards={cards} />
          <GameDeck filteredCards={filteredCards} />
        </>
      )}
    </PageWrapper>
  );
}

function GamePage() {
  const { listId } = useParams();

  return (
    <>
      <Header />
      <CardProvider listId={listId}>
        <GamePageContent />
      </CardProvider>
    </>
  );
}

export default GamePage;