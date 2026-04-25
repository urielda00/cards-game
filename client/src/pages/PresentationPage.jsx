import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import Header from '../components/Header';

const SpeechRecognitionApi =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

const normalizeWord = (word) =>
  word
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();

const MIN_PRACTICE_WORD_LENGTH = 2;

const isPracticeWord = (word) =>
  word.normalized.length >= MIN_PRACTICE_WORD_LENGTH && /[a-z]/i.test(word.normalized);

const splitWords = (text) =>
  text
    .split(/\s+/)
    .map((word) => ({ original: word.trim(), normalized: normalizeWord(word) }))
    .filter((word) => word.normalized.length > 0);

const uniqueByNormalized = (items) => {
  const seen = new Set();
  const result = [];

  items.forEach((item) => {
    if (!item.normalized || seen.has(item.normalized)) return;
    seen.add(item.normalized);
    result.push(item);
  });

  return result;
};

const compareTexts = (expectedText, spokenText) => {
  const expected = splitWords(expectedText);
  const spoken = splitWords(spokenText);
  const n = expected.length;
  const m = spoken.length;

  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 0; i <= n; i += 1) dp[i][0] = i;
  for (let j = 0; j <= m; j += 1) dp[0][j] = j;

  for (let i = 1; i <= n; i += 1) {
    for (let j = 1; j <= m; j += 1) {
      const cost = expected[i - 1].normalized === spoken[j - 1].normalized ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  let i = n;
  let j = m;
  const issues = [];
  let correct = 0;

  while (i > 0 || j > 0) {
    const expectedWord = expected[i - 1];
    const spokenWord = spoken[j - 1];

    if (
      i > 0 &&
      j > 0 &&
      expectedWord.normalized === spokenWord.normalized &&
      dp[i][j] === dp[i - 1][j - 1]
    ) {
      correct += 1;
      i -= 1;
      j -= 1;
      continue;
    }

    if (
      i > 0 &&
      j > 0 &&
      dp[i][j] === dp[i - 1][j - 1] + 1
    ) {
      issues.push({
        type: 'wrong',
        expected: expectedWord.original,
        normalized: expectedWord.normalized,
        heard: spokenWord.original,
      });
      i -= 1;
      j -= 1;
      continue;
    }

    if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      issues.push({
        type: 'missing',
        expected: expectedWord.original,
        normalized: expectedWord.normalized,
        heard: '',
      });
      i -= 1;
      continue;
    }

    j -= 1;
  }

  const mistakes = uniqueByNormalized(issues.reverse()).filter(isPracticeWord);
  const allowedMistakes = Math.ceil(n * 0.1);
  const accuracy = n === 0 ? 0 : Math.round((correct / n) * 100);

  return {
    totalWords: n,
    spokenWords: m,
    correctWords: correct,
    issueCount: issues.length,
    allowedMistakes,
    accuracy,
    passed: issues.length <= allowedMistakes,
    mistakes,
  };
};

const speakWord = (word) => {
  if (!window.speechSynthesis) {
    toast.error('הדפדפן לא תומך בהשמעת מילים');
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'en-US';
  utterance.rate = 0.82;
  window.speechSynthesis.speak(utterance);
};

const Page = styled.div`
  min-height: calc(100vh - 70px);
  padding: 2rem;
  box-sizing: border-box;
  background:
    radial-gradient(circle at top right, rgba(56, 189, 248, 0.2), transparent 34rem),
    radial-gradient(circle at bottom left, rgba(168, 85, 247, 0.18), transparent 30rem),
    #07111f;
  color: #eef6ff;
  direction: rtl;

  @media (max-width: 700px) {
    min-height: calc(100vh - 60px);
    padding: 1rem;
  }
`;

const Shell = styled.main`
  width: min(1180px, 100%);
  margin: 0 auto;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.4rem;

  @media (max-width: 700px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.6rem);
  line-height: 1.05;
`;

const Subtitle = styled.p`
  margin: 0;
  color: rgba(238, 246, 255, 0.72);
  max-width: 760px;
  line-height: 1.7;
`;

const BackLink = styled(Link)`
  color: #fff;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  padding: 0.7rem 1rem;
  background: rgba(255, 255, 255, 0.08);
  transition: 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
  }
`;

const Grid = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.24);
  border-radius: 24px;
  padding: 1.2rem;
  backdrop-filter: blur(16px);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.8rem;
`;

const CardTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
`;

const Badge = styled.span`
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  font-size: 0.85rem;
  background: ${({ $active }) => ($active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(148, 163, 184, 0.18)')};
  color: ${({ $active }) => ($active ? '#86efac' : '#cbd5e1')};
  border: 1px solid ${({ $active }) => ($active ? 'rgba(34, 197, 94, 0.28)' : 'rgba(148, 163, 184, 0.24)')};
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 380px;
  resize: vertical;
  box-sizing: border-box;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 18px;
  padding: 1rem;
  background: rgba(3, 7, 18, 0.58);
  color: #fff;
  outline: none;
  line-height: 1.8;
  font-size: 1rem;
  direction: ltr;
  text-align: left;

  &:focus {
    border-color: rgba(56, 189, 248, 0.7);
    box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.12);
  }
`;

const Hint = styled.p`
  margin: 0.7rem 0 0;
  color: rgba(238, 246, 255, 0.66);
  font-size: 0.95rem;
  line-height: 1.55;
`;

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  border: 0;
  border-radius: 14px;
  padding: 0.85rem 1rem;
  color: #fff;
  font-weight: 800;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  background: ${({ $variant }) => {
    if ($variant === 'danger') return 'linear-gradient(135deg, #ef4444, #b91c1c)';
    if ($variant === 'success') return 'linear-gradient(135deg, #22c55e, #15803d)';
    if ($variant === 'muted') return 'rgba(255, 255, 255, 0.12)';
    return 'linear-gradient(135deg, #0ea5e9, #2563eb)';
  }};
  opacity: ${({ disabled }) => (disabled ? 0.55 : 1)};
  transition: 0.18s ease;

  &:hover {
    transform: ${({ disabled }) => (disabled ? 'none' : 'translateY(-1px)')};
    filter: ${({ disabled }) => (disabled ? 'none' : 'brightness(1.08)')};
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-top: 1rem;

  @media (max-width: 760px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Stat = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.55);
`;

const StatValue = styled.div`
  font-size: 1.65rem;
  font-weight: 900;
`;

const StatLabel = styled.div`
  color: rgba(238, 246, 255, 0.62);
  margin-top: 0.2rem;
`;

const ResultPanel = styled.section`
  margin-top: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.08);
  padding: 1.2rem;
`;

const ResultTitle = styled.h2`
  margin: 0 0 0.7rem;
`;

const ResultStatus = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-radius: 999px;
  padding: 0.55rem 0.8rem;
  background: ${({ $passed }) => ($passed ? 'rgba(34, 197, 94, 0.17)' : 'rgba(239, 68, 68, 0.16)')};
  color: ${({ $passed }) => ($passed ? '#86efac' : '#fecaca')};
  border: 1px solid ${({ $passed }) => ($passed ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)')};
`;

const MistakesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 0.75rem;
`;

const MistakeCard = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.55);
  padding: 0.9rem;
  direction: ltr;
`;

const MistakeWord = styled.div`
  font-weight: 900;
  font-size: 1.3rem;
`;

const MistakeMeta = styled.div`
  color: rgba(238, 246, 255, 0.62);
  margin-top: 0.35rem;
  font-size: 0.92rem;
`;

const PracticePanel = styled.section`
  margin-top: 1rem;
  border-radius: 24px;
  padding: 1.3rem;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(168, 85, 247, 0.16));
  border: 1px solid rgba(255, 255, 255, 0.14);
  text-align: center;
`;

const PracticeWord = styled.div`
  font-size: clamp(2.4rem, 8vw, 5rem);
  font-weight: 950;
  letter-spacing: 0.02em;
  direction: ltr;
  margin: 0.9rem 0;
`;

const Feedback = styled.div`
  min-height: 1.7rem;
  color: ${({ $success }) => ($success ? '#86efac' : '#fecaca')};
  font-weight: 700;
`;

function PresentationPage() {
  const recognitionRef = useRef(null);
  const wordRecognitionRef = useRef(null);

  const [targetText, setTargetText] = useState('');
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState(null);
  const [practiceStarted, setPracticeStarted] = useState(false);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [isWordRecording, setIsWordRecording] = useState(false);
  const [wordFeedback, setWordFeedback] = useState('');

  const browserSupportsSpeech = Boolean(SpeechRecognitionApi);

  const targetWordsCount = useMemo(() => splitWords(targetText).length, [targetText]);
  const transcriptWordsCount = useMemo(() => splitWords(transcript).length, [transcript]);
  const currentPracticeWord = result?.mistakes?.[practiceIndex]?.expected || '';

  const stopRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setInterimText('');
    setIsRecording(false);
  };

  const startRecording = () => {
    if (!browserSupportsSpeech) {
      toast.error('הדפדפן לא תומך בזיהוי דיבור. מומלץ להשתמש ב-Chrome.');
      return;
    }

    if (!targetText.trim()) {
      toast.error('קודם הדבק את טקסט הפרזנטציה בצד ימין');
      return;
    }

    stopRecognition();
    setResult(null);
    setPracticeStarted(false);
    setWordFeedback('');

    const recognition = new SpeechRecognitionApi();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalChunk = '';
      let interimChunk = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalChunk += `${chunk} `;
        else interimChunk += chunk;
      }

      if (finalChunk) {
        setTranscript((prev) => `${prev}${prev ? ' ' : ''}${finalChunk.trim()}`.trim());
      }
      setInterimText(interimChunk.trim());
    };

    recognition.onerror = () => {
      toast.error('הייתה בעיה עם המיקרופון או עם זיהוי הדיבור');
      stopRecognition();
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimText('');
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    toast.success('ההקלטה התחילה');
  };

  const finishSession = () => {
    stopRecognition();

    if (!targetText.trim()) {
      toast.error('אין טקסט מקור להשוואה');
      return;
    }

    if (!transcript.trim()) {
      toast.error('אין עדיין תמלול. אפשר להקליט או להדביק ידנית את מה שנאמר.');
      return;
    }

    const nextResult = compareTexts(targetText, transcript);
    setResult(nextResult);
    setPracticeStarted(false);
    setPracticeIndex(0);
    setWordFeedback('');

    if (nextResult.passed) toast.success('מעולה, עברת את רף הדיוק שהוגדר');
    else toast('נמצאו מילים שכדאי לתרגל', { icon: '🎯' });
  };

  const resetSession = () => {
    stopRecognition();
    if (wordRecognitionRef.current) wordRecognitionRef.current.stop();
    setTranscript('');
    setInterimText('');
    setResult(null);
    setPracticeStarted(false);
    setPracticeIndex(0);
    setWordFeedback('');
  };

  const startProblemWordsPractice = () => {
    if (!result?.mistakes?.length) return;
    setPracticeStarted(true);
    setPracticeIndex(0);
    setWordFeedback('');
  };

  const listenToPracticeWord = () => {
    if (!browserSupportsSpeech) {
      toast.error('הדפדפן לא תומך בזיהוי דיבור');
      return;
    }

    if (!currentPracticeWord) return;

    if (wordRecognitionRef.current) {
      wordRecognitionRef.current.stop();
      wordRecognitionRef.current = null;
    }

    const recognition = new SpeechRecognitionApi();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsWordRecording(true);
      setWordFeedback('מקשיב... תגיד את המילה בקול');
    };

    recognition.onresult = (event) => {
      const heard = event.results[0][0].transcript;
      const expected = normalizeWord(currentPracticeWord);
      const spoken = splitWords(heard).map((word) => word.normalized);
      const matched = spoken.includes(expected);

      if (matched) {
        const isLast = practiceIndex >= result.mistakes.length - 1;
        setWordFeedback(isLast ? 'מצוין, סיימת את כל המילים' : 'נכון, עוברים למילה הבאה');
        setTimeout(() => {
          if (isLast) {
            setPracticeStarted(false);
          } else {
            setPracticeIndex((prev) => prev + 1);
            setWordFeedback('');
          }
        }, 750);
      } else {
        setWordFeedback(`לא זוהה מספיק טוב. המערכת שמעה: ${heard}`);
      }
    };

    recognition.onerror = () => {
      setWordFeedback('לא הצלחתי לשמוע. נסה שוב או השמע את המילה קודם.');
      setIsWordRecording(false);
    };

    recognition.onend = () => {
      setIsWordRecording(false);
    };

    wordRecognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <>
      <Header />
      <Page>
        <Shell>
          <TopBar>
            <TitleGroup>
              <Title>תרגול פרזנטציה</Title>
              <Subtitle>
                הדבק את הטקסט שאתה אמור להגיד, הקלט את עצמך, תקן את התמלול אם צריך, ובסיום תקבל רשימת מילים לתרגול ממוקד.
              </Subtitle>
            </TitleGroup>
            <BackLink to="/">חזרה לדף הבית</BackLink>
          </TopBar>

          {!browserSupportsSpeech && (
            <ResultPanel>
              הדפדפן הנוכחי לא תומך בזיהוי דיבור דרך Web Speech API. כדי להשתמש בהקלטה מומלץ לפתוח את האפליקציה ב-Google Chrome.
              עדיין אפשר להדביק תמלול ידנית ולהריץ השוואה.
            </ResultPanel>
          )}

          <Grid>
            <Card>
              <CardHeader>
                <CardTitle>מה נאמר בפועל</CardTitle>
                <Badge $active={isRecording}>{isRecording ? 'מקליט עכשיו' : 'מצב עריכה'}</Badge>
              </CardHeader>
              <TextArea
                value={interimText ? `${transcript}${transcript ? ' ' : ''}${interimText}` : transcript}
                onChange={(event) => setTranscript(event.target.value)}
                placeholder="כאן יופיע התמלול של הדיבור שלך. אפשר לעצור, לערוך ולתקן טעויות זיהוי לפני סיום ה-session."
              />
              <Hint>
                טיפ: אם אמרת מילה נכון אבל המיקרופון זיהה אותה לא טוב, עצור את ההקלטה ותקן כאן לפני שאתה לוחץ סיום.
              </Hint>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>טקסט הפרזנטציה</CardTitle>
                <Badge>{targetWordsCount} מילים</Badge>
              </CardHeader>
              <TextArea
                value={targetText}
                onChange={(event) => setTargetText(event.target.value)}
                placeholder="Paste your English presentation text here..."
              />
              <Hint>
                סטייה של עד 10% מהמילים תיחשב תקינה. מעבר לזה תקבל מילים בעייתיות לתרגול ממוקד.
              </Hint>
            </Card>
          </Grid>

          <Controls>
            {!isRecording ? (
              <Button onClick={startRecording} disabled={!browserSupportsSpeech || !targetText.trim()}>
                התחל הקלטה
              </Button>
            ) : (
              <Button $variant="danger" onClick={stopRecognition}>
                עצור מיקרופון לעריכה
              </Button>
            )}
            <Button $variant="success" onClick={finishSession} disabled={!targetText.trim() || !transcript.trim()}>
              סיום Session ובדיקת דיוק
            </Button>
            <Button $variant="muted" onClick={resetSession}>
              איפוס Session
            </Button>
          </Controls>

          <Stats>
            <Stat>
              <StatValue>{targetWordsCount}</StatValue>
              <StatLabel>מילים בטקסט</StatLabel>
            </Stat>
            <Stat>
              <StatValue>{transcriptWordsCount}</StatValue>
              <StatLabel>מילים בתמלול</StatLabel>
            </Stat>
            <Stat>
              <StatValue>{result ? `${result.accuracy}%` : '-'}</StatValue>
              <StatLabel>דיוק</StatLabel>
            </Stat>
            <Stat>
              <StatValue>{result ? result.mistakes.length : '-'}</StatValue>
              <StatLabel>מילים לתרגול</StatLabel>
            </Stat>
          </Stats>

          {result && (
            <ResultPanel>
              <ResultTitle>תוצאות</ResultTitle>
              <ResultStatus $passed={result.passed}>
                {result.passed
                  ? 'עברת את ה-session לפי רף סטייה של עד 10%'
                  : 'נמצאו יותר מדי חריגות ביחס לרף של 10%'}
              </ResultStatus>

              {result.mistakes.length === 0 ? (
                <Hint>לא נמצאו מילים בעייתיות. עבודה מעולה.</Hint>
              ) : (
                <>
                  <MistakesGrid>
                    {result.mistakes.map((item) => (
                      <MistakeCard key={`${item.normalized}-${item.heard}`}>
                        <MistakeWord>{item.expected}</MistakeWord>
                        <MistakeMeta>
                          {item.type === 'missing'
                            ? 'לא זוהתה בתמלול'
                            : `זוהה במקום זה: ${item.heard}`}
                        </MistakeMeta>
                      </MistakeCard>
                    ))}
                  </MistakesGrid>
                  <Controls>
                    <Button onClick={startProblemWordsPractice}>פתח משחק מילים בעייתיות</Button>
                  </Controls>
                </>
              )}
            </ResultPanel>
          )}

          {practiceStarted && currentPracticeWord && (
            <PracticePanel>
              <CardTitle>
                מילה {practiceIndex + 1} מתוך {result.mistakes.length}
              </CardTitle>
              <PracticeWord>{currentPracticeWord}</PracticeWord>
              <Feedback $success={wordFeedback.includes('נכון') || wordFeedback.includes('מצוין')}>
                {wordFeedback || 'אמור את המילה בקול כדי להתקדם'}
              </Feedback>
              <Controls style={{ justifyContent: 'center' }}>
                <Button onClick={listenToPracticeWord} disabled={isWordRecording}>
                  {isWordRecording ? 'מקשיב...' : 'אמור את המילה'}
                </Button>
                <Button $variant="muted" onClick={() => speakWord(currentPracticeWord)}>
                  השמע הגייה
                </Button>
                <Button
                  $variant="muted"
                  onClick={() => {
                    if (practiceIndex < result.mistakes.length - 1) setPracticeIndex((prev) => prev + 1);
                    else setPracticeStarted(false);
                    setWordFeedback('');
                  }}
                >
                  דלג
                </Button>
              </Controls>
            </PracticePanel>
          )}
        </Shell>
      </Page>
    </>
  );
}

export default PresentationPage;
