import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// --- إعدادات Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyBkFy0E6Nt84109ewBOAjwzLpo41NikvWU",
  authDomain: "chat-b3d0d.firebaseapp.com",
  projectId: "chat-b3d0d",
  storageBucket: "chat-b3d0d.firebasestorage.app",
  messagingSenderId: "817165041972",
  appId: "1:817165041972:web:283c53909fb4c07f136561",
  measurementId: "G-L8WV0SQGEC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messagesRef = collection(db, "messages");

// --- متغيرات ---
let myUsername = localStorage.getItem("chatUser") || ""; // جلب الاسم المحفوظ

const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const userDisplay = document.getElementById('current-user-display');
const msgContainer = document.getElementById('messages-container');

// --- 1. التحقق من تسجيل الدخول عند التحميل ---
window.onload = function() {
    if (myUsername) {
        showChat(); // إذا كان الاسم محفوظاً، ادخل مباشرة
    }
};

function showChat() {
    loginScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');
    userDisplay.innerText = "أنت: " + myUsername;
    loadMessages();
}

// --- 2. تسجيل الدخول ---
document.getElementById('login-btn').addEventListener('click', () => {
    const input = document.getElementById('username-input');
    const name = input.value.trim();
    if (name) {
        myUsername = name;
        localStorage.setItem("chatUser", myUsername); // حفظ الاسم في المتصفح
        showChat();
    } else {
        alert("الرجاء كتابة اسمك");
    }
});

// --- 3. إرسال الرسالة ---
async function sendMessage() {
    const input = document.getElementById('message-input');
    const text = input.value.trim();
    if (text === "") return;

    try {
        await addDoc(messagesRef, {
            text: text,
            sender: myUsername,
            createdAt: serverTimestamp()
        });
        input.value = "";
        input.focus();
    } catch (error) {
        console.error("Error:", error);
    }
}

document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('message-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// --- 4. تحميل الرسائل ---
function loadMessages() {
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    onSnapshot(q, (snapshot) => {
        msgContainer.innerHTML = "";
        snapshot.forEach((doc) => {
            const data = doc.data();
            renderMessage(data);
        });
        scrollToBottom();
    });
}

function renderMessage(data) {
    const div = document.createElement('div');
    const isMe = data.sender === myUsername;
    div.classList.add('message', isMe ? 'my-message' : 'other-message');

    let time = data.createdAt ? data.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "...";
    
    // محتوى الرسالة النصي للبحث
    div.setAttribute('data-text', data.text.toLowerCase());

    div.innerHTML = `
        ${!isMe ? `<span class="sender-name">${data.sender}</span>` : ''}
        ${data.text}
        <span class="msg-time">${time}</span>
    `;
    msgContainer.appendChild(div);
}

function scrollToBottom() {
    msgContainer.scrollTop = msgContainer.scrollHeight;
}

// --- 5. ميزة البحث في الرسائل ---
document.getElementById('search-input').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const allMessages = document.querySelectorAll('.message');

    allMessages.forEach(msgDiv => {
        const text = msgDiv.getAttribute('data-text');
        if (text.includes(searchTerm)) {
            msgDiv.style.display = "block"; // إظهار
        } else {
            msgDiv.style.display = "none"; // إخفاء
        }
    });
});
