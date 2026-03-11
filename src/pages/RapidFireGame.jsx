import styled, { keyframes, css } from 'styled-components';
import Header from '../components/Header';
import { useRapidFire } from '../hooks/useRapidFire';

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
  padding: 1.5rem;
  max-width: 600px;
  margin: 0 auto;
  min-height: 80vh;
`;

const SetupTitle = styled.h2`
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
`;

const ListSelector = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 2rem;
`;

const ListOption = styled.label`
  display: flex;
  align-items: center;
  background: white;
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid ${props => props.$selected ? '#007bff' : '#eee'};
  cursor: pointer;
  transition: all 0.2s;
  
  input { margin-left: 1rem; width: 20px; height: 20px; }
  span { font-size: 1.1rem; font-weight: 500; direction: rtl; }
`;

const ModeToggle = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 400px;
  background: #fff3cd;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 2px solid #ffeeba;
  cursor: pointer;
  font-weight: bold;
  color: #856404;

  input { width: 20px; height: 20px; }
`;

const StartButton = styled.button`
  width: 100%;
  padding: 1.2rem;
  font-size: 1.4rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 15px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(40, 167, 69, 0.3);
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #218838;
    transform: translateY(-2px);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const StatsBar = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 2rem;
  gap: 0.5rem;
`;

const StatItem = styled.div`
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 1.1rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  flex-grow: 1;
  text-align: center;
  white-space: nowrap;
`;

const QuestionCard = styled.div`
  background: ${props => {
    if (props.$feedback === 'correct') return '#d4edda';
    if (props.$feedback === 'incorrect') return '#f8d7da';
    return 'white';
  }};
  width: 100%;
  padding: 2.5rem 1rem;
  border-radius: 20px;
  text-align: center;
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  color: ${props => {
    if (props.$feedback === 'correct') return '#155724';
    if (props.$feedback === 'incorrect') return '#721c24';
    return '#007bff';
  }};
  transition: all 0.2s ease;
  animation: ${props => {
    if (props.$feedback === 'correct') return css`${pulse} 0.4s ease-in-out`;
    if (props.$feedback === 'incorrect') return css`${shake} 0.4s cubic-bezier(.36,.07,.19,.97) both`;
    return 'none';
  }};
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: 100%;
  @media (max-width: 400px) { grid-template-columns: 1fr; }
`;

const OptionButton = styled.button`
  padding: 1.2rem;
  font-size: 1.1rem;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.1s;
  font-weight: 500;
  &:disabled { opacity: 0.7; cursor: default; }
`;

function RapidFireGame() {
	const {
		lists,
		selectedListIds,
		gameState,
		currentQuestion,
		score,
		timeLeft,
		feedback,
		isLimitedMode,
		lives,
		setIsLimitedMode,
		setGameState,
		toggleList,
		startGame,
		handleAnswer,
	} = useRapidFire();

	if (gameState === 'setup') {
		return (
			<>
				<Header />
				<GameContainer>
					<SetupTitle>בחר רשימות למשחק</SetupTitle>
					<ListSelector>
						{lists.map((list) => (
							<ListOption key={list.id} $selected={selectedListIds.includes(list.id)}>
								<input
									type='checkbox'
									checked={selectedListIds.includes(list.id)}
									onChange={() => toggleList(list.id)}
								/>
								<span>{list.name}</span>
							</ListOption>
						))}
					</ListSelector>

					<ModeToggle>
						<span>מצב 3 פסילות ❤️</span>
						<input 
							type="checkbox" 
							checked={isLimitedMode} 
							onChange={(e) => setIsLimitedMode(e.target.checked)} 
						/>
					</ModeToggle>

					<StartButton disabled={selectedListIds.length === 0} onClick={startGame}>
						התחל משחק 🚀
					</StartButton>
				</GameContainer>
			</>
		);
	}

	if (gameState === 'playing' && currentQuestion) {
		return (
			<>
				<Header />
				<GameContainer>
					<StatsBar>
						<StatItem>⏱️ {timeLeft}s</StatItem>
						<StatItem>🏆 {score}</StatItem>
						{isLimitedMode && (
							<StatItem style={{color: '#dc3545'}}>
								{'❤️'.repeat(lives)}
							</StatItem>
						)}
					</StatsBar>
					
					<QuestionCard $feedback={feedback}>
						{currentQuestion.word.front}
					</QuestionCard>

					<OptionsGrid>
						{currentQuestion.options.map((opt) => (
							<OptionButton 
								key={opt.id} 
								onClick={() => handleAnswer(opt.id)}
								disabled={!!feedback}
							>
								{opt.back}
							</OptionButton>
						))}
					</OptionsGrid>
				</GameContainer>
			</>
		);
	}

	if (gameState === 'finished') {
		return (
			<>
				<Header />
				<GameContainer>
					<SetupTitle>{lives <= 0 && isLimitedMode ? 'נפסלת! 💔' : 'המשחק נגמר!'}</SetupTitle>
					<div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
						{lives <= 0 && isLimitedMode ? '💀' : '🎉'}
					</div>
					<h1 style={{ fontSize: '3rem', color: '#28a745' }}>{score}</h1>
					<p>נקודות שצברת</p>
					<StartButton onClick={() => setGameState('setup')}>שחק שוב</StartButton>
				</GameContainer>
			</>
		);
	}

	return null;
}

export default RapidFireGame;