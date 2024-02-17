import './App.css';
import { useState, useEffect, useRef } from 'react';

function App() {

  const [HasBegan, setHasBegan] = useState(false);

  const [dividerPos, setDividerPos] = useState('diagonal');

  const [gameData, setGameData] = useState({});

  const [currentQuestion, setCurrentQuestion] = useState(1);

  const [fadeResults, setFadeResults] = useState(false);

  const [isDebounced, setIsDebounced] = useState(true);

  const [isMobile, setIsMobile] = useState(false);

  const [gameOver, setGameOver] = useState(false);

  const [hintOn, setHintOn] = useState(false);

  const [resultDividerFade, setResultDividerFade] = useState(false);

  const [highScore, setHighScore] = useState(localStorage.getItem('highScore'));

  const [athletes, setAthletes] = useState({
    leftAthlete: '',
    rightAthlete: '',
    nextAthlete: '',
  })
  const [canNavigate, setCanNavigate] = useState({
    goBack: false,
    goNext: false
  })

  const [answers, setAnswers] = useState({
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
    7: null,
    8: null,
    9: null,
    10: null,
  })

  const [animationIds, setAnimationIds] = useState({
    vsIcon: 'default', //default, correct, incorrect
    goLeft: false,
    showLeftScore: true,
    showRightScore: false,
    showNextScore: false,
  })

  const { goBack, goNext } = canNavigate;


  const { leftAthlete, rightAthlete, nextAthlete } = athletes;

  const { goLeft, showLeftScore, showRightScore, showNextScore } = animationIds;

  const correctTags = { true: 'correct', false: 'incorrect', null: 'default' }

  const [leftArrow, rightArrow] = ["<", ">"]


  function handleBeginButton() {
    setHasBegan(true);
  }


  function endGame() {
    setGameOver(true);
    setHasBegan(false);
  }

  function ResultMessage(numberOfQuestionsCorrect) {

    const correctPercent = Math.round(numberOfQuestionsCorrect / gameData.length * 100);
    let message = '';
    let messages = [];
    if (numberOfQuestionsCorrect < 5) {
      messages = ["Oh wow that's impressively bad are you sure you didn't misclick ? Better luck next time. 😭",
        "I'm not sure what to say except that is a very low score ! Do better."]
      message = "Oh wow that's impressively bad are you sure you didn't misclick ? Better luck next time. 😭";
    }
    else if (numberOfQuestionsCorrect < 10) {
      message = "Not too shabby. But could do better. ";
    }

    else if (numberOfQuestionsCorrect < 20) {
      message = "Good effort ! You know a lot about athletes, perhaps you'll end up on this list yourself one day.";
    }

    else if (numberOfQuestionsCorrect > 20) {
      message = "Exceptional effort ! You clearly know a thing or two about sports. Are you an athlete ?"
    }

    return message;
  }

  function DetermineHighScore(numberOfQuestionsCorrect) {
    const setScore = highScore === null ? numberOfQuestionsCorrect : numberOfQuestionsCorrect > highScore ? numberOfQuestionsCorrect : highScore;
    setHighScore(setScore);
    localStorage.setItem('highScore', setScore);

    return setScore;
  }


  function verifyTagNotNull(answers, currentQuestion) {

    if (answers && answers[currentQuestion]) {
      return answers[currentQuestion].result;
    } else {

      return "null";

    }
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
  }


  function DeterminePos(direction) {

    if (currentQuestion === 1 && !goLeft) return '';

    const modulo = currentQuestion % 3;

    if (direction === 'left') {
      if (goLeft) return modulo === 1 ? 'leftPosReverse' : modulo === 2 ? 'nextPosReverse' : 'rightPosReverse';
      else
        return modulo === 1 ? 'leftPos' : modulo === 2 ? 'nextPos' : 'rightPos';
    }
    else if (direction === 'right') {
      if (goLeft) return modulo === 1 ? 'rightPosReverse' : modulo === 2 ? 'leftPosReverse' : 'nextPosReverse';
      else
        return modulo === 1 ? 'rightPos' : modulo === 2 ? 'leftPos' : 'nextPos';
    }
    else {
      if (goLeft) return modulo === 1 ? 'nextPosReverse' : modulo === 2 ? 'rightPosReverse' : 'leftPosReverse';
      else
        return modulo === 1 ? 'nextPos' : modulo === 2 ? 'rightPos' : 'leftPos';
    }
  }


  function changeAthletes() {
    setCurrentQuestion(prev => {

      const updatedQuestion = prev + 1;
      const modulo = prev % 3;
      const athletetoChange =
        modulo === 1 ? 'leftAthlete' : modulo === 2 ? 'rightAthlete' : 'nextAthlete';

      const athleteScoreToUpdate = modulo === 0 ? 'showNextScore' : modulo === 1 ? 'showLeftScore' : 'showRightScore';
      const vsToChange = verifyTagNotNull(answers, updatedQuestion);
      setTimeout(() => {
        setAthletes((prev) => ({ ...prev, [athletetoChange]: gameData[updatedQuestion + 1] }));
        setAnimationIds(prev => ({ ...prev, vsIcon: vsToChange === 'null' ? 'default' : vsToChange ? 'correct' : 'incorrect', goLeft: false, [athleteScoreToUpdate]: false }));
      }, 1000);

      return updatedQuestion;
    });
  }


  function highLightVsIcon(answer) {
    if (answer === true) {
      setAnimationIds(prev => ({ ...prev, vsIcon: 'correct' }));
    }
    else setAnimationIds(prev => ({ ...prev, vsIcon: 'incorrect' }));
    setTimeout(() => {
      setAnimationIds(prev => ({ ...prev, vsIcon: 'default' }));
    }, 1000)
  }


  // Keeps a record of answers and their assets.
  function handleAnswer(answer, athlete) {

    setIsDebounced(false);
    const modulo = currentQuestion % 3;

    // Determine current images on screen
    const athleteImages = modulo === 1 ? { 'leftAthlete': leftAthlete.Image, 'rightAthlete': rightAthlete.Image } : modulo === 2
      ? { 'rightAthlete': rightAthlete.Image, 'nextAthlete': nextAthlete.Image }
      : { 'nextAthlete': nextAthlete.Image, 'leftAthlete': leftAthlete.Image };

    const athleteDescriptions = modulo === 1 ? { 'leftAthlete': leftAthlete.Description, 'rightAthlete': rightAthlete.Description } : modulo === 2
      ? { 'rightAthlete': rightAthlete.Description, 'nextAthlete': nextAthlete.Description }
      : { 'nextAthlete': nextAthlete.Description, 'leftAthlete': leftAthlete.Description };

    const athleteNames = modulo === 1 ? { 'leftAthlete': leftAthlete.Name, 'rightAthlete': rightAthlete.Name } : modulo === 2
      ? { 'rightAthlete': rightAthlete.Name, 'nextAthlete': nextAthlete.Name }
      : { 'nextAthlete': nextAthlete.Name, 'leftAthlete': leftAthlete.Name };

    const athleteHints = modulo === 1 ? { 'leftAthlete': leftAthlete.Hint, 'rightAthlete': rightAthlete.Hint } : modulo === 2
      ? { 'rightAthlete': rightAthlete.Hint, 'nextAthlete': nextAthlete.Hint }
      : { 'nextAthlete': nextAthlete.Hint, 'leftAthlete': leftAthlete.Hint };

    const athleteScores = modulo === 1 ? { 'leftAthlete': leftAthlete.Score, 'rightAthlete': rightAthlete.Score } : modulo === 2
      ? { 'rightAthlete': rightAthlete.Score, 'nextAthlete': nextAthlete.Score }
      : { 'nextAthlete': nextAthlete.Score, 'leftAthlete': leftAthlete.Score };

    const subtractAthleteResult = modulo === 1 ? leftAthlete.Score - rightAthlete.Score : modulo === 2 ? rightAthlete.Score - nextAthlete.Score
      : nextAthlete.Score - leftAthlete.Score;

    // Returns true or false;
    const result = answer === 'higher' ? subtractAthleteResult <= 0 : subtractAthleteResult >= 0;

    setAnimationIds(prev => ({ ...prev, [athlete]: true }));

    setAnswers(prev => ({
      ...prev, [currentQuestion]: {
        result, athleteNames, athleteImages, athleteDescriptions, athleteHints,
        athleteScores
      }
    }));
    highLightVsIcon(result);

    if (currentQuestion < gameData.length - 1) {
      if (result === false) {
        setTimeout(() => {
          endGame();
        }, 2000);
      }
      else {
        setTimeout(() => {
          setHintOn(false);
          changeAthletes(false);
          setIsDebounced(true);
        }, 2000);
      }
    } else {
      setTimeout(() => {
        endGame();
      }, 2000)
    }
  }


  // Change athlete when naviation bar is used.
  function changeNavAthlete(direction) {

    const questionToUse = direction === 'back' ? currentQuestion - 1 : currentQuestion + 1;
    const modulo = questionToUse % 3;
    const athletestoChange = modulo === 1 ? ['leftAthlete', 'rightAthlete'] : modulo === 2 ? ['rightAthlete', 'nextAthlete']
      : ['nextAthlete', 'leftAthlete'];

    if (direction === 'next') {

      function determineAnswered() {
        setAnimationIds((prev) => {
          const scoreTag = athletestoChange[1] === 'leftAthlete' ? 'showLeftScore' : athletestoChange[1] === 'rightAthlete' ?
            'showRightScore' : 'showNextScore';

          return { ...prev, goLeft: false, [scoreTag]: answers[questionToUse] ? true : false };
        });
      }

      if (answers[questionToUse - 1] !== null && answers[questionToUse] === null) { changeAthletes(); determineAnswered(); }
      else if (answers[questionToUse - 1] !== null && questionToUse < gameData.length) { changeAthletes(); determineAnswered(); }
      else if (questionToUse === gameData.length - 1) { changeAthletes(); determineAnswered(); }
    }
    else {
      if (!(currentQuestion === 1)) {
        athletestoChange.map((athlete) => {

          setAthletes((prev) => {
            const newState = { ...prev };

            newState[athlete] = {
              ...newState[athlete],
              Name: answers[questionToUse]['athleteNames'][athlete],
              Description: answers[questionToUse]['athleteDescriptions'][athlete],
              Score: answers[questionToUse]['athleteScores'][athlete],
              Image: answers[questionToUse]['athleteImages'][athlete],
              Hint: answers[questionToUse]['athleteHints'][athlete]
            };

            return newState;
          });

          console.log(answers[questionToUse].result ? 'correct' : 'incorrect');

          setAnimationIds((prev) => {
            const scoreTag = athlete === 'leftAthlete' ? 'showLeftScore' : athlete === 'rightAthlete' ? 'showRightScore' : 'showNextScore';
            return { ...prev, vsIcon: answers[questionToUse].result ? 'correct' : 'incorrect', [scoreTag]: true };
          });
        });
      }
    }
  }


  function updateNav() {

    if (currentQuestion > 1 && currentQuestion < (gameData.length - 1) && answers[currentQuestion] != null) setCanNavigate({ goBack: true, goNext: true })
    else if (currentQuestion === 1 && answers[currentQuestion] === null) setCanNavigate({ goBack: false, goNext: false })
    else if (currentQuestion > 1 && answers[currentQuestion] === null) setCanNavigate({ goBack: true, goNext: false });
    else setCanNavigate({ goBack: false, goNext: true });
  }

  function handleNavClick(enabled, direction) {

    if (isDebounced) {
      changeNavAthlete(direction);

      if (direction === 'back' && enabled) {
        setAnimationIds(prev => ({ ...prev, goLeft: true }))
        setCurrentQuestion(prev => prev - 1);
      }
      else if (direction === ' next' && enabled) setCurrentQuestion(prev => prev + 1);

      setIsDebounced(false);

      setTimeout(() => {
        setIsDebounced(true);
      }, 1000);
    }
  }

  // Enable navigation by swiping screen on mobile ** Works on mobile screen but not scaled down **
  const touchStartY = useRef(null);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (!touchStartY.current) {
      return;
    }

    const currentY = e.touches[0].clientY;
    const diffY = currentY - touchStartY.current;

    if (Math.abs(diffY) > 50) {
      // You can customize the threshold for considering it a swipe
      if (diffY > 0) {
        handleNavClick(goBack, 'back');
      } else {
        handleNavClick(goNext, 'next');
      }

      // Reset touch start position
      touchStartY.current = null;
    }
  };


  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 600);
    };


    checkIfMobile();

    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);


  useEffect(() => {
    const athletes = async () => {
      try {
        const response = await fetch('/athletesInfo.json')
        let data = await response.json();
        setGameData(data);
        setAthletes({ leftAthlete: data[0], rightAthlete: data[1], nextAthlete: data[2] });
      } catch (error) {
        console.log(error);
      }
    }

    athletes();
  }, []);


  useEffect(() => {
    setDividerPos(HasBegan ? 'straight' : 'diagonal');
  }, [HasBegan]);


  useEffect(() => {
    updateNav();
  }, [currentQuestion])

  useEffect(() => {
    console.log(Object.values(answers).splice(0, currentQuestion));
  }, [answers])


  return (
    <div className="App">
      {/* End game result screen */}
      {gameOver && <div className='result-container'>
        <img className='result-background' src="./black-image.png" />
        <div className='result-divider' id={resultDividerFade ? 'shrink-out' : ''}></div>
        <h5 className='you-scored-title' id={fadeResults === true ? 'hidden' : ''}>You scored: </h5>
        <div className='result-score-container' id={fadeResults === true ? 'hidden' : ''}>
          <p className='athlete-score' id={fadeResults === true ? 'hidden' : ''}>{Object.values(answers).splice(0, currentQuestion).reduce((acc, answer) => acc + answer.result, 0)}</p>
        </div>
        <p className='result-description' id={fadeResults === true ? 'hidden' : ''}>{ResultMessage(Object.values(answers).splice(0, currentQuestion).reduce((acc, answer) => acc + answer.result, 0))} </p>
        <div className='high-score' id={fadeResults === true ? 'hidden' : ''}>High Score: {highScore}</div>
        <p className='play-again-button' id={fadeResults === true ? 'hidden' : ''} onClick={() => { setFadeResults(true); setResultDividerFade(true); setTimeout(() => { window.location.reload(); }, 1000) }}>Back to menu</p>
      </div>
      }

      {/* Game screen */}
      {!gameOver && <>
        <div className='titles-container'>
          <div className='title' id={HasBegan ? 'hidden' : 'show'}>Higher or Lower</div>
          <h3 className='sub-title' id={HasBegan ? 'hidden' : 'show'}>Athlete Edition</h3>
        </div>
        <div className='divider' id={dividerPos}></div>
        <div className='begin-button' onClick={handleBeginButton} id={HasBegan ? 'hidden' : 'show'}>Begin</div>
      </>}
      {HasBegan && (
        <div game-container onTouchStart={isMobile ? handleTouchStart : {}}
          onTouchMove={isMobile ? handleTouchMove : {}}>
          {
            <div className='top-bar'>
              <p className='arrow-icon' id={!(goBack) ? 'inactive-arrow-icon' : ''} onClick={() => handleNavClick(goBack, 'back')}>{leftArrow}</p>
              <ul className='progress-bar'>
                <li id={correctTags[verifyTagNotNull(answers, currentQuestion - 1)] + '-inactive-icon'} style={currentQuestion === 1 ? { color: 'transparent' } : {}} >{currentQuestion === 1 ? '-' : currentQuestion - 1}</li>
                <li id={correctTags[verifyTagNotNull(answers, currentQuestion)] + '-active-icon'}>{currentQuestion}</li>
                <li id={correctTags[verifyTagNotNull(answers, currentQuestion + 1)] + '-inactive-icon'}>{currentQuestion === gameData.length - 1 ? '🚧' : currentQuestion + 1}</li>
              </ul>
              <p className='arrow-icon' id={!(goNext) ? 'inactive-arrow-icon' : ''} onClick={() => handleNavClick(goNext, 'next')}>{rightArrow}</p>
            </div>
          }

          {HasBegan && <div className='vs-icon' id={animationIds['vsIcon']}>{'VS'}</div>}
          <div className='left-athlete-container' id={DeterminePos('left')}>
            <img className="athlete-image" src={`${leftAthlete.Image}`} alt="Left Athlete" draggable="false" />

            <div className='athlete-text-container' >
              <p className='athlete-name'>{leftAthlete.Name}</p>
              <p className='has-text'>has</p>

              {!showLeftScore && <div className='higher-lower-container'>
                <p className='higher-text' onClick={() => handleAnswer('higher', 'showLeftScore')}>Higher</p>
                <p className='lower-text' onClick={() => handleAnswer('lower', 'showLeftScore')}>Lower</p>
              </div>}

              {showLeftScore && <p className='athlete-score'>{leftAthlete.Score}</p>}
              <p className='athlete-description'>{leftAthlete.Description}</p>
            </div>

          </div>

          <div className='right-athlete-container' id={DeterminePos('right')}>
            <img className="athlete-image" src={`${rightAthlete.Image}`} alt="Right Athlete" draggable="false" />
            <div className='athlete-text-container'>
              <p className='athlete-name'>{rightAthlete.Name}</p>
              <p className='has-text'>has</p>

              {!showRightScore && <div className='higher-lower-container'>
                <p className='higher-text' onClick={() => handleAnswer('higher', 'showRightScore')}>Higher</p>
                <p className='lower-text' onClick={() => handleAnswer('lower', 'showRightScore')}>Lower</p>
              </div>}

              {showRightScore && <p className='athlete-score'>{rightAthlete.Score}</p>}
              <p className='athlete-description'>{rightAthlete.Description}</p>

            </div>
          </div>

          <div className='next-athlete-container' id={DeterminePos('next')}>
            <img className='athlete-image' src={`${currentQuestion < gameData.length - 1 ? nextAthlete.Image : gameData[currentQuestion - 2].Image}`} alt="Next Athlete" draggable="false" />

            <div className='athlete-text-container'>
              <p className='athlete-name'>{currentQuestion < gameData.length - 1 ? nextAthlete.Name : gameData[currentQuestion - 2].Name}</p>
              <p className='has-text'>has</p>

              {!showNextScore && <div className='higher-lower-container'>
                <p className='higher-text' onClick={() => handleAnswer('higher', 'showNextScore')}>Higher</p>
                <p className='lower-text' onClick={() => handleAnswer('lower', 'showNextScore')}>Lower</p>
              </div>}

              {showNextScore && <p className='athlete-score'>{currentQuestion < gameData.length - 1 ? nextAthlete.Score : gameData[currentQuestion - 2].Score}</p>}
              <p className='athlete-description'>{currentQuestion < gameData.length - 1 ? nextAthlete.Description : gameData[currentQuestion - 2].Description}</p>

            </div>
          </div>

          {HasBegan && <div className='hint-container'>
            {isMobile && <p className='hint-button' onClick={() => setHintOn(true)}>{isMobile ? "🤷‍♂️" : "Show hint"}</p>}
            {!isMobile && !hintOn && <p className='hint-button' onClick={() => setHintOn(true)}>{isMobile ? "🤷‍♂️" : "Show hint"}</p>}
            {hintOn && <p className='hint-text' id={hintOn ? 'hide' : ''}>{gameData[currentQuestion].Hint}</p>}
          </div>}
          
        </div>
      )}
    </div>
  );
}

export default App;
