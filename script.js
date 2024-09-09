document.addEventListener('DOMContentLoaded', () => {
    const wordLength = 5;
    const maxGuesses = 6;
    let dictionary = [];
    let solution = '';
    let currentGuess = '';
    let currentRowIndex = 0;
    let usedLetters = new Set();
    let letterStatus = {}; 
    let submittedRows = new Set(); 

    const grid = document.getElementById('grid');
    const keyboard = document.getElementById('keyboard');
    const message = document.getElementById('message');
    const modeToggle = document.getElementById('mode-toggle');
    const muteToggle = document.getElementById('mute-toggle');
    const backgroundMusic = document.getElementById('background-music');
    const muteIcon = document.getElementById('mute-icon');
    const muteText = document.getElementById('mute-text');

    let currentTheme = 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateModeToggleText();

    fetch('wordle.txt')
        .then(response => response.text())
        .then(text => {
            dictionary = text.split('\n').map(word => word.trim().toLowerCase()).filter(word => word.length === wordLength);
            initializeGame();
        });

    function initializeGame() {
        solution = dictionary[Math.floor(Math.random() * dictionary.length)];

        for (let i = 0; i < maxGuesses; i++) {
            const row = document.createElement('div');
            row.className = 'row';
            for (let j = 0; j < wordLength; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                row.appendChild(cell);
            }
            grid.appendChild(row);
        }

        const keyboardLayout = [
            'qwertyuiop',
            'asdfghjkl',
            'zxcvbnm'
        ];

        keyboardLayout.forEach((row) => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'keyboard-row';
            row.split('').forEach(key => {
                const button = document.createElement('button');
                button.textContent = key;
                button.className = 'key';
                button.addEventListener('click', () => handleKeyPress(key));
                rowDiv.appendChild(button);
            });
            keyboard.appendChild(rowDiv);
        });

        const actionRow = document.createElement('div');
        actionRow.className = 'keyboard-row';

        const submitButton = document.createElement('button');
        submitButton.textContent = 'Ent';
        submitButton.className = 'action-button submit-button'; 
        submitButton.addEventListener('click', handleSubmitGuess);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Del';
        deleteButton.className = 'action-button delete-button'; 
        deleteButton.addEventListener('click', () => {
            if (currentGuess.length > 0 && !submittedRows.has(currentRowIndex)) {
                currentGuess = currentGuess.slice(0, -1);
                updateGrid();
            }
        });

        actionRow.appendChild(deleteButton);
        actionRow.appendChild(submitButton);
        keyboard.appendChild(actionRow);

        document.addEventListener('keydown', (event) => {
            if (event.key.length === 1 && event.key.match(/[a-z]/i) && !submittedRows.has(currentRowIndex)) {
                handleKeyPress(event.key);
            } else if (event.key === 'Enter') {
                handleSubmitGuess();
            } else if (event.key === 'Backspace' && !submittedRows.has(currentRowIndex)) {
                if (currentGuess.length > 0) {
                    currentGuess = currentGuess.slice(0, -1);
                    updateGrid();
                }
            }
        });

        modeToggle.addEventListener('click', toggleMode);
        muteToggle.addEventListener('click', toggleMute);

        console.log('Audio element:', backgroundMusic);
        console.log('Audio muted:', backgroundMusic.muted);
    }

    function handleKeyPress(key) {
        if (currentGuess.length < wordLength) {
            currentGuess += key;
            updateGrid();
        }
    }

    function updateGrid() {
        const rows = grid.querySelectorAll('.row');
        const currentRow = rows[currentRowIndex];
        const cells = currentRow.querySelectorAll('.cell');

        cells.forEach((cell, index) => {
            cell.textContent = currentGuess[index] || '';
            if (index < currentGuess.length) {
                cell.classList.remove('correct', 'present', 'absent');
            }
        });

        const deleteButton = document.querySelector('.delete-button');
        deleteButton.disabled = currentGuess.length === 0 || submittedRows.has(currentRowIndex);
    }

    function handleSubmitGuess() {
        if (currentGuess.length !== wordLength) {
            message.textContent = `Guess must be ${wordLength} letters`;
            return;
        }

        if (!dictionary.includes(currentGuess)) {
            message.textContent = 'Not in word list';
            return;
        }

        const currentRow = grid.querySelectorAll('.row')[currentRowIndex];
        const cells = currentRow.querySelectorAll('.cell');

        let correctCount = 0;
        currentGuess.split('').forEach((letter, index) => {
            if (letter === solution[index]) {
                cells[index].classList.add('correct');
                correctCount++;
                letterStatus[letter] = 'correct'; 
            } else if (solution.includes(letter)) {
                cells[index].classList.add('present');
                letterStatus[letter] = 'present'; 
            } else {
                cells[index].classList.add('absent');
                letterStatus[letter] = 'absent'; 
            }
        });

        usedLetters = new Set([...usedLetters, ...currentGuess.split('')]);
        updateKeyboardColors();
        submittedRows.add(currentRowIndex);

        if (correctCount === wordLength) {
            message.textContent = 'Congratulations! You guessed the word!';
        } else if (currentRowIndex < maxGuesses - 1) {
            currentRowIndex++;
            currentGuess = '';
            updateGrid();
        } else {
            message.textContent = `Game over! The word was ${solution}`;
        }
    }

    function updateKeyboardColors() {
        document.querySelectorAll('.key').forEach(key => {
            const letter = key.textContent;
            key.classList.remove('correct', 'present', 'absent');
            if (letterStatus[letter] === 'correct') {
                key.classList.add('correct');
            } else if (letterStatus[letter] === 'present') {
                key.classList.add('present');
            } else if (letterStatus[letter] === 'absent') {
                key.classList.add('absent');
            }
        });
    }

    function toggleMode() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        updateModeToggleText();
    }

    function updateModeToggleText() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        modeToggle.textContent = currentTheme === 'dark' ? 'Light Theme' : 'Dark Theme';
    }

    function toggleMute() {
        if (backgroundMusic.muted) {
            backgroundMusic.muted = false;
            muteIcon.classList.remove('fa-volume-mute');
            muteIcon.classList.add('fa-volume-up');
            muteText.textContent = ' ';
        } else {
            backgroundMusic.muted = true;
            muteIcon.classList.remove('fa-volume-up');
            muteIcon.classList.add('fa-volume-mute');
            muteText.textContent = ' ';
        }
        // console.log('Audio muted:', backgroundMusic.muted);
    }
});
