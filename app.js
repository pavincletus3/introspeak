document.addEventListener('DOMContentLoaded', function () {
    const passages = [
        "The quick brown fox jumps over the lazy dog.",
        "To be or not to be, that is the question.",
        "In the middle of difficulty lies opportunity.",
        "Life is what happens when you're busy making other plans.",
        "The only limit to our realization of tomorrow will be our doubts of today."
    ];

    let selectedLanguage = 'en-US';
    let recognition; // Speech recognition instance
    const startButton = document.getElementById('start');
    const accuracyDiv = document.getElementById('accuracy');
    const mistakesDiv = document.getElementById('mistakes');
    const passageTextDiv = document.getElementById('passage-text');
    const historyList = document.getElementById('history-list');
    const languageSelect = document.getElementById('language');
    let isListening = false; // To track if recognition is active

    // Set the initial passage
    setNewPassage();

    // Event listener for the start button
    startButton.addEventListener('click', () => {
        if (!window.SpeechRecognition) {
            alert("Sorry, your browser does not support speech recognition. Please use Google Chrome.");
            return;
        }

        if (isListening) {
            recognition.stop(); // Stop if already listening
            return;
        }

        // Initialize Speech Recognition
        recognition = new window.SpeechRecognition();
        recognition.lang = selectedLanguage;
        recognition.interimResults = true;
        recognition.continuous = false; // Stop listening after recognizing

        recognition.onstart = () => {
            isListening = true;
            startButton.textContent = "Stop Listening";
            startButton.disabled = false;
        };

        recognition.onresult = (event) => {
            let spokenText = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                spokenText += event.results[i][0].transcript + " ";
            }
            updatePassageFeedback(spokenText.trim(), passageTextDiv.innerText);
        };

        recognition.onerror = (event) => {
            accuracyDiv.textContent = "Error recognizing speech. Please try again.";
            resetButton();
        };

        recognition.onend = () => {
            resetButton();
            setNewPassage(); // Set new passage after recognition ends
        };

        recognition.start();
        startButton.textContent = "Listening...";
        startButton.disabled = true;
    });

    // Event listener for language selection
    languageSelect.addEventListener('change', (event) => {
        selectedLanguage = event.target.value;
        alert(`Language changed to ${selectedLanguage}`);
    });

    function setNewPassage() {
        passageTextDiv.innerHTML = formatPassage(passages[Math.floor(Math.random() * passages.length)]);
    }

    function formatPassage(passage) {
        return passage.split(' ').map(word => `<span class="word">${word}</span>`).join(' ');
    }

    function updatePassageFeedback(spoken, original) {
        const spokenWords = spoken.toLowerCase().split(' ');
        const originalWords = original.toLowerCase().split(' ');
        const spans = document.querySelectorAll('.word');

        spans.forEach((span, index) => {
            if (index < spokenWords.length) {
                const spokenWord = spokenWords[index];
                if (spokenWord === originalWords[index]) {
                    span.style.color = 'green'; // Correctly pronounced
                } else {
                    span.style.color = 'red'; // Incorrectly pronounced
                }
            } else {
                span.style.color = 'black'; // Words not yet spoken
            }
        });

        // Calculate accuracy
        const correctCount = spokenWords.filter((word, index) => word === originalWords[index]).length;
        const accuracy = ((correctCount / originalWords.length) * 100).toFixed(2);
        accuracyDiv.textContent = `Accuracy: ${accuracy}%`;
    }

    function resetButton() {
        isListening = false;
        startButton.textContent = "Start Speaking";
        startButton.disabled = false;
    }

    document.getElementById('login').addEventListener('click', () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
    
        // Simple user check (replace with real authentication)
        if (email === "user@example.com" && password === "password123") {
            localStorage.setItem('currentUser', email);
            loadUserHistory(email);
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('history-container').style.display = 'block';
        } else {
            alert("Invalid credentials!");
        }
    });
    
    function loadUserHistory(user) {
        const history = JSON.parse(localStorage.getItem(user + '-history') || '[]');
        const historyList = document.getElementById('user-history-list');
        historyList.innerHTML = ''; // Clear existing history
    
        history.forEach((item, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${item.accuracy} - ${item.passage}`;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => deleteHistory(user, index);
            listItem.appendChild(deleteButton);
            historyList.appendChild(listItem);
        });
    }
    
    function deleteHistory(user, index) {
        let history = JSON.parse(localStorage.getItem(user + '-history') || '[]');
        history.splice(index, 1); // Remove the selected item
        localStorage.setItem(user + '-history', JSON.stringify(history));
        loadUserHistory(user); // Refresh the history list
    }
    
    document.getElementById('logout').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('history-container').style.display = 'none';
    });
    

    // Ensure browser compatibility for SpeechRecognition
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
});
