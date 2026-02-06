// استيراد المكتبات عبر الويب مباشرة
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// 🔴 إعدادات Firebase الخاصة بك (جاهزة)
const firebaseConfig = {
  apiKey: "AIzaSyBkFy0E6Nt84109ewBOAjwzLpo41NikvWU",
  authDomain: "chat-b3d0d.firebaseapp.com",
  projectId: "chat-b3d0d",
  storageBucket: "chat-b3d0d.firebasestorage.app",
  messagingSenderId: "817165041972",
  appId: "1:817165041972:web:283c53909fb4c07f136561",
  measurementId: "G-L8WV0SQGEC"
};

// تهيئة الاتصال
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messagesRef = collection(db, "messages"); // اسم الجدول في القاعدة

let myUsername = "";

// 1. دالة تسجيل الدخول
document.getElementById('login-btn').addEventListener('click', () => {
    const input = document.getElementById('username-input');
    if (input.value.trim() !== "") {
        myUsername = input.value;
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('chat-screen').classList.remove('hidden');
        document.getElementById('current-user-display').innerText = "أنت: " + myUsername;
        
        loadMessages(); // بدء تحميل الرسائل
    } else {
        alert("الرجاء كتابة اسمك");
    }
});

// 2. دالة إرسال الرسالة
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
        alert("فشل الإرسال: تأكد من إعداد قواعد Firestore (Rules) للسماح بالكتابة.");
    }
}

// تفعيل زر الإرسال والإنتر
document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('message-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// 3. استقبال الرسائل لحظياً
function loadMessages() {
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    onSnapshot(q, (snapshot) => {
        const container = document.getElementById('messages-container');
        container.innerHTML = ""; // مسح القديم

        snapshot.forEach((doc) => {
            const data = doc.data();
            const div = document.createElement('div');
            
            // هل الرسالة لي أم لشخص آخر؟
            const isMe = data.sender === myUsername;
            div.classList.add('message', isMe ? 'my-message' : 'other-message');

            // تحويل الوقت
            let time = "";
            if (data.createdAt) {
                time = data.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

            // بناء محتوى الرسالة
            let senderHtml = !isMe ? `<span class="sender-name">${data.sender}</span>` : '';
            
            div.innerHTML = `
                ${senderHtml}
                ${data.text}
                <span class="msg-time">${time}</span>
            `;

            container.appendChild(div);
        });

        // النزول لآخر رسالة
        container.scrollTop = container.scrollHeight;
    });
}