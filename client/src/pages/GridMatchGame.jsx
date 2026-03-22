import styled, { keyframes, css } from 'styled-components';
import Header from '../components/Header';
import { useGridMatch } from '../hooks/useGridMatch';
import toast from 'react-hot-toast';

// --- Animations ---
const shake = keyframes`
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
`;

// --- Styled Components ---
const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: calc(100vh - 70px);
  padding: 1rem;
  box-sizing: border-box;
  overflow: hidden;
`;

const OptionSection = styled.div`
  width: 100%;
  max-width: 400px;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  border: 1px solid #eee;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 12px;
  width: 100%;
  max-width: 500px;
  height: 60vh;
  margin-bottom: 1rem;
`;

const Card = styled.button`
  width: 100%; height: 100%;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 5px;
  word-break: break-word;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);

  /* Logic for Colors and Animations */
  background: ${props => {
    if (props.$feedback === 'correct') return '#d4edda';
    if (props.$feedback === 'incorrect') return '#f8d7da';
    if (props.$selected) return '#007bff';
    return 'white';
  }};

  color: ${props => props.$selected && !props.$feedback ? 'white' : '#333'};
  
  border: 2px solid ${props => {
    if (props.$feedback === 'correct') return '#28a745';
    if (props.$feedback === 'incorrect') return '#dc3545';
    if (props.$selected) return '#007bff';
    return '#eee';
  }};

  visibility: ${props => props.$matched ? 'hidden' : 'visible'};

  animation: ${props => {
    if (props.$feedback === 'correct') return css`${pulse} 0.5s ease-in-out`;
    if (props.$feedback === 'incorrect') return css`${shake} 0.5s cubic-bezier(.36,.07,.19,.97) both`;
    return 'none';
  }};
`;

const StartButton = styled.button`
  width: 100%;
  max-width: 400px;
  padding: 1.2rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 15px;
  font-weight: bold;
  cursor: pointer;
  margin-top: auto;
  margin-bottom: 1rem;
  transition: opacity 0.3s;

  &:active { transform: scale(0.98); }
`;

const ToggleRow = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;
`;

const StatsBar = styled.div`
  display: flex; justify-content: space-between; width: 100%; max-width: 500px; margin-bottom: 1rem;
`;

const StatBadge = styled.div`
  background: white; padding: 0.5rem 1rem; border-radius: 20px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  color: ${props => props.$danger ? '#dc3545' : '#333'};
`;

function GridMatchGame() {
    const { 
        lists, selectedListIds, gameState, cards, selectedCard, matches, timer, 
        timerMode, setTimerMode, isLimitedLives, setIsLimitedLives, lives, feedback,
        setSelectedListIds, setGameState, startGame, handleCardClick 
    } = useGridMatch();

    const onStartClick = () => {
        if (selectedListIds.length === 0) {
            toast.error("חובה לבחור לפחות רשימה אחת!");
            return;
        }
        startGame();
    };

    if (gameState === 'setup') {
        return (
            <>
                <Header />
                <GameContainer>
                    <h2 style={{margin: '1rem 0'}}>הגדרות משחק</h2>
                    <OptionSection>
                        <p style={{marginBottom: '0.8rem', fontWeight: 'bold'}}>1. בחר רשימות:</p>
                        <div style={{maxHeight: '150px', overflowY: 'auto'}}>
                            {lists.map(list => (
                                <label key={list.id} style={{display: 'flex', marginBottom: '8px', cursor: 'pointer'}}>
                                    <input type="checkbox" checked={selectedListIds.includes(list.id)} onChange={() => {
                                        setSelectedListIds(prev => prev.includes(list.id) ? prev.filter(i => i !== list.id) : [...prev, list.id]);
                                    }} />
                                    <span style={{marginRight: '8px'}}>{list.name}</span>
                                </label>
                            ))}
                        </div>
                    </OptionSection>

                    <OptionSection>
                        <p style={{marginBottom: '0.8rem', fontWeight: 'bold'}}>2. מצבי משחק:</p>
                        <ToggleRow>
                            <span>סוג טיימר:</span>
                            <select value={timerMode} onChange={(e) => setTimerMode(e.target.value)}>
                                <option value="up">רגיל (עולה)</option>
                                <option value="down">אתגר (דקה יורדת)</option>
                            </select>
                        </ToggleRow>
                        <ToggleRow>
                            <span>הגבלת 3 פסילות:</span>
                            <input type="checkbox" checked={isLimitedLives} onChange={(e) => setIsLimitedLives(e.target.checked)} />
                        </ToggleRow>
                    </OptionSection>

                    <StartButton onClick={onStartClick}>התחל משחק 🧩</StartButton>
                </GameContainer>
            </>
        );
    }

    if (gameState === 'playing') {
        return (
            <>
                <Header />
                <GameContainer>
                    <StatsBar>
                        <StatBadge>⏱️ {timer}ש'</StatBadge>
                        {isLimitedLives && <StatBadge $danger>{'❤️'.repeat(lives)}</StatBadge>}
                    </StatsBar>
                    <Grid>
                        {cards.map(card => (
                            <Card 
                                key={card.id} 
                                $selected={selectedCard?.id === card.id || feedback.ids.includes(card.id)}
                                $matched={matches.includes(card.wordId)}
                                $feedback={feedback.ids.includes(card.id) ? feedback.type : null}
                                onClick={() => handleCardClick(card)}
                            >
                                {card.text}
                            </Card>
                        ))}
                    </Grid>
                </GameContainer>
            </>
        );
    }

    return (
        <>
            <Header />
            <GameContainer style={{justifyContent: 'center'}}>
                <div style={{textAlign: 'center'}}>
                    <h1 style={{fontSize: '4rem'}}>{gameState === 'lost' ? '💔' : '🎉'}</h1>
                    <h2>{gameState === 'lost' ? 'נגמר המשחק!' : 'כל הכבוד!'}</h2>
                    <StartButton onClick={() => setGameState('setup')}>שחק שוב</StartButton>
                </div>
            </GameContainer>
        </>
    );
}

export default GridMatchGame;