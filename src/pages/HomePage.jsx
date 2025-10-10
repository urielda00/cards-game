import { Link } from 'react-router-dom';
import styled from 'styled-components';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
`;

const BackgroundOverlay = styled.div`
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.3);
  z-index: 0;
`;

const PageContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 3rem;
  color: #fff;
  text-align: center;
  text-shadow: 0 0 10px rgba(0,255,255,0.7);
`;

const ButtonsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 2rem;
  width: 100%;
  max-width: 300px;
`;

const ButtonLink = styled(Link)`
  font-size: 1.5rem;
  padding: 1rem 2rem;
  text-decoration: none;
  color: #fff;
  border-radius: 12px;
  background: rgba(0, 123, 255, 0.8);
  backdrop-filter: blur(5px);
  box-shadow: 0 0 15px rgba(0,123,255,0.6);
  text-align: center;
  transition: all 0.3s;

  &:hover {
    background: rgba(0, 123, 255, 1);
    transform: translateY(-3px);
    box-shadow: 0 0 25px rgba(0,123,255,0.9);
  }
`;

function HomePage() {
  return (
    <PageWrapper>
      <img 
        src="/back.jpg" 
        alt="background" 
        style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -1}}
      />
      <BackgroundOverlay />
      <PageContent>
        <Title>Flashcards App</Title>
        <ButtonsWrapper>
          <ButtonLink to="/lists">משחק מילים</ButtonLink>
          <ButtonLink 
            to="/image-lists" 
            style={{
              background: 'rgba(40, 167, 69, 0.8)', 
              boxShadow: '0 0 15px rgba(40, 167, 69, 0.6)'
            }}
          >
            משחק תמונות
          </ButtonLink>
        </ButtonsWrapper>
      </PageContent>
    </PageWrapper>
  );
}

export default HomePage;