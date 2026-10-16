lucide.createIcons();

// FIREBASE CONFIGURATION (Haqiqiy kalitlar kiritildi)
const firebaseConfig = {
    apiKey: "AIzaSyAgJnEOr1ARCk0iBMpD6NsNiIldPmyi8Ig",
    authDomain: "english-project-17.firebaseapp.com",
    projectId: "english-project-17",
    storageBucket: "english-project-17.firebasestorage.app",
    messagingSenderId: "877460603584",
    appId: "1:877460603584:web:045a61f1e15a239753a325",
    measurementId: "G-DN11972DD3"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Fetch Likes from Firebase on load
async function fetchLikes() {
    try {
        const doc = await db.collection("campaign").doc("likesData").get();
        if (doc.exists) {
            document.getElementById('like-count').innerText = doc.data().count;
        } else {
            document.getElementById('like-count').innerText = "10";
        }
    } catch (e) {
        document.getElementById('like-count').innerText = "15";
    }
}
fetchLikes();

// Handle Like Click & Update Firebase
async function handleLike() {
    try {
        const docRef = db.collection("campaign").doc("likesData");
        const doc = await docRef.get();
        let current = 0;
        if (doc.exists) {
            current = doc.data().count || 0;
        }
        const newCount = current + 1;
        document.getElementById('like-count').innerText = newCount;
        
        // Confetti animation effect
        confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
        });

        await docRef.set({ count: newCount });
    } catch (e) {
        showToast("Liked!");
    }
}

// Random Tip Generator
const tips = [
    "A good friend is like a sunshine on a cloudy day! ☀️",
    "Always share your snacks with your best friend! 🍫",
    "Listen more than you speak when your friend is sad. 👂",
    "A small smile can make your friend's day better! 😊",
    "True friends grow and learn together! 📚"
];
function generateRandomTip() {
    const randomIndex = Math.floor(Math.random() * tips.length);
    document.getElementById('fortune-text').innerText = `"${tips[randomIndex]}"`;
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');
    toastMsg.innerText = msg;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

let speechSynth = window.speechSynthesis;
let speechUtterance = null;
let isSpeaking = false;

function toggleSpeech() {
    if (!('speechSynthesis' in window)) {
        showToast("Not supported in browser.");
        return;
    }

    const btnLabel = document.getElementById('tts-label');
    const btnIcon = document.getElementById('tts-icon');

    if (isSpeaking) {
        speechSynth.cancel();
        isSpeaking = false;
        btnLabel.innerText = "Listen";
        btnIcon.setAttribute('data-lucide', 'volume-2');
        lucide.createIcons();
    } else {
        const text = document.getElementById('speech-text').innerText;
        speechUtterance = new SpeechSynthesisUtterance(text);
        speechUtterance.rate = 0.85;

        speechUtterance.onend = () => {
            isSpeaking = false;
            btnLabel.innerText = "Listen";
            btnIcon.setAttribute('data-lucide', 'volume-2');
            lucide.createIcons();
        };

        speechSynth.speak(speechUtterance);
        isSpeaking = true;
        btnLabel.innerText = "Stop";
        btnIcon.setAttribute('data-lucide', 'square');
        lucide.createIcons();
    }
}

function copySpeech() {
    const text = document.getElementById('speech-text').innerText;
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast("Speech copied!");
}

const quizData = [
    {
        q: "Your friend is sad. What do you do?",
        options: [
            { text: "Listen and help them.", score: 2 },
            { text: "Ignore them.", score: 0 },
            { text: "Laugh at them.", score: 0 }
        ]
    },
    {
        q: "Your friend tells you a secret. What do you do?",
        options: [
            { text: "Keep it safe and don't tell anyone.", score: 2 },
            { text: "Tell other classmates.", score: 0 },
            { text: "Post it online.", score: 0 }
        ]
    },
    {
        q: "You made a mistake. What do you do?",
        options: [
            { text: "Say sorry to your friend.", score: 2 },
            { text: "Blame your friend.", score: 0 },
            { text: "Do nothing.", score: 0 }
        ]
    }
];

let currentQ = 0;
let score = 0;

function loadQuestion() {
    const qData = quizData[currentQ];
    document.getElementById('quiz-progress').innerText = `Question ${currentQ + 1} of ${quizData.length}`;
    document.getElementById('quiz-score-badge').innerText = `Score: ${score}`;
    document.getElementById('quiz-question').innerText = qData.q;

    const optsBox = document.getElementById('quiz-options');
    optsBox.innerHTML = '';

    qData.options.forEach((opt) => {
        const btn = document.createElement('button');
        btn.className = "w-full text-left p-4 rounded-xl border border-slate-200 bg-white hover:bg-purple-50 transition-all font-medium text-sm text-slate-700 flex justify-between items-center group";
        btn.innerHTML = `<span>${opt.text}</span><i data-lucide="chevron-right" class="w-4 h-4 text-slate-400 group-hover:text-purple-600"></i>`;
        btn.onclick = () => {
            score += opt.score;
            if (currentQ + 1 < quizData.length) {
                currentQ++;
                loadQuestion();
            } else {
                showQuizResult();
            }
        };
        optsBox.appendChild(btn);
    });
    lucide.createIcons();
}

function showQuizResult() {
    document.getElementById('question-box').classList.add('hidden');
    const resultBox = document.getElementById('quiz-result');
    resultBox.classList.remove('hidden');

    confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
    });

    const title = document.getElementById('result-title');
    const desc = document.getElementById('result-desc');

    if (score >= 6) {
        title.innerText = "🌟 Great Best Friend!";
        desc.innerText = "You are an amazing and caring friend!";
    } else {
        title.innerText = "👍 Good Friend!";
        desc.innerText = "You are doing well, keep being a good friend!";
    }
}

function resetQuiz() {
    currentQ = 0;
    score = 0;
    document.getElementById('quiz-result').classList.add('hidden');
    document.getElementById('question-box').classList.remove('hidden');
    loadQuestion();
}

loadQuestion();

function togglePosterModal() {
    const modal = document.getElementById('poster-modal');
    modal.classList.toggle('hidden');
    modal.classList.toggle('flex');
}

function printPoster() {
    window.print();
}