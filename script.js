document.addEventListener('DOMContentLoaded', () => {
    const wordLength = 5;
    const maxGuesses = 6;
    let dictionary = [];
    let solution = '';
    let currentGuess = '';
    let currentRowIndex = 0;
    let usedLetters = new Set(); 

    const grid = document.getElementById('grid');
    const keyboard = document.getElementById('keyboard');
    const message = document.getElementById('message');

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
        submitButton.textContent = 'Submit';
        submitButton.className = 'action-button';
        submitButton.addEventListener('click', handleSubmitGuess);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'action-button';
        deleteButton.addEventListener('click', () => {
            currentGuess = currentGuess.slice(0, -1);
            updateGrid();
        });

        actionRow.appendChild(deleteButton);
        actionRow.appendChild(submitButton);
        keyboard.appendChild(actionRow);

        document.addEventListener('keydown', (event) => {
            if (event.key.length === 1 && event.key.match(/[a-z]/i)) {
                handleKeyPress(event.key);
            } else if (event.key === 'Enter') {
                handleSubmitGuess();
            } else if (event.key === 'Backspace') {
                currentGuess = currentGuess.slice(0, -1);
                updateGrid();
            }
        });
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
        });
    }

    function handleSubmitGuess() {
        if (currentGuess.length === wordLength) {
            if (dictionary.includes(currentGuess)) {
                checkGuess();
            } else {
                message.textContent = 'Not a valid word.';
            }
        }
    }

    function checkGuess() {
        const correct = solution.split('');
        const guess = currentGuess.split('');

        const feedback = [];
        guess.forEach((letter, index) => {
            if (correct[index] === letter) {
                feedback.push('correct');
            } else if (correct.includes(letter)) {
                feedback.push('present');
            } else {
                feedback.push('absent');
                usedLetters.add(letter);
            }
        });

        updateFeedback(feedback);
        updateKeyboard();

        if (currentGuess === solution) {
            message.textContent = 'Congratulations! You guessed the word!';
        } else {
            currentGuess = '';
            currentRowIndex++;
            if (currentRowIndex >= maxGuesses) {
                message.textContent = `Game Over! The correct word was ${solution}.`;
            } else {
                updateGrid(); 
            }
        }
    }

    function updateFeedback(feedback) {
        const currentRow = grid.querySelectorAll('.row')[currentRowIndex];
        const cells = currentRow.querySelectorAll('.cell');

        feedback.forEach((status, index) => {
            cells[index].className = `cell ${status}`;
        });
    }

    function updateKeyboard() {
        const keys = document.querySelectorAll('.key');
        keys.forEach(key => {
            if (usedLetters.has(key.textContent)) {
                key.classList.add('disabled');
                key.disabled = true; 
            }
        });
    }
});
