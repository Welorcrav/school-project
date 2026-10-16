lucide.createIcons();

// FIREBASE CONFIGURATION
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

// Default local tips & Firebase dynamic tips
let tips = [
    "A good friend is like a sunshine on a cloudy day! ☀️",
    "Always share your snacks with your best friend! 🍫",
    "Listen more than you speak when your friend is sad. 👂",
    "A small smile can make your friend's day better! 😊",
    "True friends grow and learn together! 📚"
];

// Load dynamic tips from Firebase admin panel
async function loadFirebaseTips() {
    try {
        const snapshot = await db.collection("campaign_tips").get();
        snapshot.forEach(doc => {
            if (doc.data().text) {
                tips.push(doc.data().text);
            }
        });
    } catch (e) {
        console.log("Using default tips");
    }
}
loadFirebaseTips();

// Random Tip Generator
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

// --- VISITOR COMMENTS LOGIC ---

// Load Comments from Firebase Firestore with Admin Replies
async function loadComments() {
    const listContainer = document.getElementById('comments-list');
    if (!listContainer) return;

    try {
        const snapshot = await db.collection("campaign_comments")
            .orderBy("createdAt", "desc")
            .get();

        listContainer.innerHTML = "";
        
        if (snapshot.empty) {
            listContainer.innerHTML = `<p class="text-slate-400 text-sm italic text-center py-4">No comments yet. Be the first to write one! ✨</p>`;
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            const commentCard = document.createElement('div');
            commentCard.className = "bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2";
            
            let adminReplyHtml = "";
            if (data.adminReply) {
                adminReplyHtml = `
                    <div class="mt-2 pl-3 border-l-2 border-purple-500 bg-purple-50/60 p-2.5 rounded-r-xl space-y-1">
                        <span class="text-[11px] font-bold text-purple-700 flex items-center gap-1">
                            🛡️ Admin Javobi:
                        </span>
                        <p class="text-slate-700 text-xs leading-relaxed">${escapeHtml(data.adminReply)}</p>
                    </div>
                `;
            }

            commentCard.innerHTML = `
                <div class="flex items-center justify-between">
                    <span class="font-heading font-bold text-sm text-purple-900">${escapeHtml(data.name)}</span>
                    <span class="text-[10px] text-slate-400">Visitor</span>
                </div>
                <p class="text-slate-600 text-sm leading-relaxed">${escapeHtml(data.text)}</p>
                ${adminReplyHtml}
            `;
            listContainer.appendChild(commentCard);
        });
    } catch (e) {
        listContainer.innerHTML = `<p class="text-rose-400 text-sm text-center py-4">Failed to load comments.</p>`;
    }
}

// Check if device already left a comment
function checkCommentStatus() {
    const formBox = document.getElementById('comment-form-box');
    if (!formBox) return;

    if (localStorage.getItem("hasLeftComment") === "true") {
        formBox.innerHTML = `
            <div class="text-center py-6 bg-purple-50/70 rounded-2xl border border-purple-100 space-y-2">
                <div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <i data-lucide="check-circle" class="w-6 h-6"></i>
                </div>
                <h4 class="font-heading font-bold text-slate-900 text-base">Thank you for your comment!</h4>
                <p class="text-slate-600 text-xs">Siz bu qurilmadan allaqachon o'z izohingizni qoldirgansiz. ✅</p>
            </div>
        `;
        lucide.createIcons();
    }
}

// Handle New Comment Submission
async function handleCommentSubmit(e) {
    e.preventDefault();
    
    if (localStorage.getItem("hasLeftComment") === "true") {
        alert("Siz allaqachon izoh yozgansiz!");
        return;
    }

    const nameInput = document.getElementById('comment-name');
    const textInput = document.getElementById('comment-text');

    const name = nameInput.value.trim();
    const text = textInput.value.trim();

    if (!name || !text) return;

    try {
        await db.collection("campaign_comments").add({
            name: name,
            text: text,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        localStorage.setItem("hasLeftComment", "true");

        showToast("Comment posted successfully! 🎉");
        loadComments();
        checkCommentStatus();
    } catch (e) {
        alert("Xatolik yuz berdi: " + e.message);
    }
}

// Simple security helper against HTML injection
function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}

// Automatically load comments and check status when page opens
loadComments();
checkCommentStatus();