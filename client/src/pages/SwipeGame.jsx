import styled, { keyframes, css } from 'styled-components';
import Header from '../components/Header';
import { useSwipeGame } from '../hooks/useSwipeGame';

// --- Animations ---
const shake = keyframes`
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
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
  direction: rtl;
`;

const SwipeCard = styled.div`
  background: ${props => {
    if (props.$feedback === 'correct') return '#d4edda';
    if (props.$feedback === 'incorrect') return '#f8d7da';
    return 'white';
  }};
  width: 100%;
  max-width: 400px;
  height: 40vh;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  margin: 1.5rem 0;
  transition: all 0.2s;
  border: 2px solid ${props => {
    if (props.$feedback === 'correct') return '#28a745';
    if (props.$feedback === 'incorrect') return '#dc3545';
    return 'transparent';
  }};

  animation: ${props => {
    if (props.$feedback === 'correct') return css`${pulse} 0.4s ease-in-out`;
    if (props.$feedback === 'incorrect') return css`${shake} 0.4s cubic-bezier(.36,.07,.19,.97) both`;
    return 'none';
  }};
`;

const Word = styled.h2` 
  font-size: 2.8rem; 
  margin: 0; 
  color: #333; 
  @media (max-width: 400px) { font-size: 2.2rem; }
`;

const Translation = styled.p` 
  font-size: 1.8rem; 
  margin-top: 1rem; 
  color: #666; 
  font-style: italic; 
  @media (max-width: 400px) { font-size: 1.5rem; }
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  width: 100%;
  max-width: 400px;
  margin-top: auto;
  margin-bottom: 2rem;
`;

const AnswerButton = styled.button`
  padding: 1.2rem;
  font-size: 2rem;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  color: white;
  background: ${props => props.$correct ? '#28a745' : '#dc3545'};
  box-shadow: 0 4px 15px ${props => props.$correct ? 'rgba(40,167,69,0.3)' : 'rgba(220,53,69,0.3)'};
  transition: transform 0.1s;
  &:active { transform: scale(0.92); }
`;

const OptionBox = styled.div`
  width: 100%;
  max-width: 400px;
  background: #f8f9fa;
  padding: 1.2rem;
  border-radius: 15px;
  margin-bottom: 1rem;
  border: 1px solid #eee;
`;

const ToggleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
  &:last-child { margin-bottom: 0; }
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
  font-size: 1.2rem;
  cursor: pointer;
  margin-top: auto;
  margin-bottom: 2rem;
  &:disabled { background: #ccc; cursor: not-allowed; }
`;

const StatsBar = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 400px;
  margin-bottom: 1rem;
`;

const StatBadge = styled.div`
  background: white;
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  color: ${props => props.$danger ? '#dc3545' : '#333'};
`;

function SwipeGame() {
    const { 
        lists, selectedListIds, setSelectedListIds, gameState, setGameState, 
        currentPair, score, timer, timerMode, setTimerMode, isLimitedLives, 
        setIsLimitedLives, useGlobalDistractors, setUseGlobalDistractors,
        lives, feedback, startGame, handleAnswer 
    } = useSwipeGame();

    if (gameState === 'setup') {
        return (
            <>
                <Header />
                <GameContainer>
                    <h2 style={{margin: '1.5rem 0'}}>נכון או לא נכון</h2>
                    <OptionBox>
                        <p style={{fontWeight: 'bold', marginBottom: '0.8rem'}}>1. בחר רשימות:</p>
                        <div style={{maxHeight: '120px', overflowY: 'auto'}}>
                            {lists.map(list => (
                                <label key={list.id} style={{display: 'flex', marginBottom: '8px', cursor: 'pointer', alignItems: 'center'}}>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedListIds.includes(list.id)}
                                        onChange={() => {
                                            setSelectedListIds(prev => prev.includes(list.id) ? prev.filter(i => i !== list.id) : [...prev, list.id]);
                                        }} 
                                    />
                                    <span style={{marginRight: '8px'}}>{list.name}</span>
                                </label>
                            ))}
                        </div>
                    </OptionBox>

                    <OptionBox>
                        <p style={{fontWeight: 'bold', marginBottom: '0.8rem'}}>2. הגדרות:</p>
                        <ToggleRow>
                            <span>סוג טיימר:</span>
                            <select value={timerMode} onChange={e => setTimerMode(e.target.value)}>
                                <option value="up">עולה</option>
                                <option value="down">יורד (60 ש')</option>
                            </select>
                        </ToggleRow>
                        <ToggleRow>
                            <span>הגבלת 3 פסילות:</span>
                            <input type="checkbox" checked={isLimitedLives} onChange={e => setIsLimitedLives(e.target.checked)} />
                        </ToggleRow>
                        <ToggleRow>
                            <span>מיקס מילים גדול:</span>
                            <input type="checkbox" checked={useGlobalDistractors} onChange={e => setUseGlobalDistractors(e.target.checked)} />
                        </ToggleRow>
                    </OptionBox>

                    <StartButton onClick={startGame} disabled={selectedListIds.length === 0}>
                        התחל משחק ↔️
                    </StartButton>
                </GameContainer>
            </>
        );
    }

    if (gameState === 'playing' && currentPair) {
        return (
            <>
                <Header />
                <GameContainer>
                    <StatsBar>
                        <StatBadge>⏱️ {timer}ש'</StatBadge>
                        <StatBadge>🏆 {score}</StatBadge>
                        {isLimitedLives && <StatBadge $danger>{'❤️'.repeat(lives)}</StatBadge>}
                    </StatsBar>
                    
                    <SwipeCard $feedback={feedback}>
                        <Word>{currentPair.word.front}</Word>
                        <div style={{color: '#999', margin: '10px 0'}}>פירושו:</div>
                        <Translation>{currentPair.displayTranslation}</Translation>
                    </SwipeCard>

                    <ActionButtons>
                        <AnswerButton onClick={() => handleAnswer(false)}>❌</AnswerButton>
                        <AnswerButton $correct onClick={() => handleAnswer(true)}>✅</AnswerButton>
                    </ActionButtons>
                </GameContainer>
            </>
        );
    }

    return (
        <>
            <Header />
            <GameContainer style={{justifyContent: 'center'}}>
                <div style={{textAlign: 'center'}}>
                    <h1 style={{fontSize: '5rem'}}>{gameState === 'lost' ? '💀' : '🏆'}</h1>
                    <h2>{gameState === 'lost' ? 'נגמר המשחק!' : 'כל הכבוד!'}</h2>
                    <p style={{fontSize: '1.5rem', margin: '1rem 0'}}>ניקוד סופי: {score}</p>
                    <StartButton onClick={() => setGameState('setup')}>שחק שוב</StartButton>
                </div>
            </GameContainer>
        </>
    );
}

export default SwipeGame;