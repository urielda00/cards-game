import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../components/Header';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 12vh;
  /* החלק הקריטי: מחשב את הגובה בדיוק כדי שלא תהיה גלילה */
  height: calc(100vh - 70px); 
  width: 100%;
  position: relative;
  overflow: hidden; /* מונע גלילה פנימית */
  box-sizing: border-box;

  @media (max-width: 600px) {
    height: calc(100vh - 60px);
    padding-top: 8vh;
  }
`;

const BackgroundImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
`;

const BackgroundOverlay = styled.div`
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  z-index: 0;
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90%;
  max-width: 350px;
  padding: 1rem;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  color: #fff;
  margin-bottom: 2.5rem;
  text-align: center;
  text-shadow: 0 0 10px rgba(0,0,0,0.5);

  @media (max-width: 600px) {
    font-size: 1.8rem;
  }
`;

const GameButton = styled(Link)`
  width: 100%;
  font-size: 1.1rem;
  padding: 0.9rem;
  margin-bottom: 1.2rem;
  text-decoration: none;
  color: #fff;
  border-radius: 15px;
  background: ${props => props.$color || 'rgba(0, 123, 255, 0.8)'};
  backdrop-filter: blur(5px);
  text-align: center;
  transition: all 0.3s;
  font-weight: bold;
  border: 1px solid rgba(255,255,255,0.2);
  box-sizing: border-box;

  &:hover {
    transform: scale(1.03);
    background: ${props => props.$color ? props.$color.replace('0.8', '1') : 'rgba(0, 123, 255, 1)'};
  }
`;

function GamesMenuPage() {
  return (
    <>
      <Header />
      <PageWrapper>
        <BackgroundImage src="/back.jpg" alt="background" />
        <BackgroundOverlay />
        <Content>
          <Title>בחר משחק</Title>
          <GameButton to="/games/rapid-fire" $color="rgba(220, 53, 69, 0.8)">
            🚀 ספרינט 60 שניות
          </GameButton>
          <GameButton to="/games/grid-match" $color="rgba(102, 16, 242, 0.8)">
            🧩 התאמת זוגות
          </GameButton>
          <GameButton to="/games/swipe" $color="rgba(23, 162, 184, 0.8)">
            ↔️ נכון או לא נכון
          </GameButton>
        </Content>
      </PageWrapper>
    </>
  );
}

export default GamesMenuPage;