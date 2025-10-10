import { useParams } from 'react-router-dom';
import { ImageCardProvider, useImageCards } from '../context/ImageCardContext';
import styled from 'styled-components';
import Header from '../components/Header';
import ImageGameDeck from '../components/ImageGameDeck';
import FilterControls from '../components/FilterControls';
import { useState, useMemo } from 'react';

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

function ImageGame() {
  const { cards } = useImageCards();
  const [filter, setFilter] = useState('all');

  const filteredCards = useMemo(() => {
    if (filter === 'starred') {
      return cards.filter(card => card.starred);
    }
    return cards;
  }, [cards, filter]);

  return (
    <PageWrapper>
      {cards.length === 0 ? (
        <EmptyStateContainer>
          <h2>רשימה זו ריקה מתמונות.</h2>
          <p>ניתן להוסיף תמונות חדשות דרך קוד המקור בצד השרת.</p>
        </EmptyStateContainer>
      ) : (
        <>
          <FilterControls currentFilter={filter} setFilter={setFilter} cards={cards} />
          <ImageGameDeck filteredCards={filteredCards} />
        </>
      )}
    </PageWrapper>
  );
}

function ImageGamePage() {
  const { listId } = useParams();

  return (
    <>
      <Header />
      <ImageCardProvider listId={listId}>
        <ImageGame />
      </ImageCardProvider>
    </>
  );
}

export default ImageGamePage;