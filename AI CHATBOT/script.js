const prompt = document.querySelector("#prompt");
const chatContainer = document.querySelector(".chat-container");
const imagebtn = document.querySelector("#image");
const micBtn = document.querySelector("#mic-btn");

// Using a stable model version
const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyD1u9TiiMYzNkMJGEdOk-yQhtWmEr_Q6FE";

let user = { data: null };

async function generateResponse(aiChatBox) {
    const aiTextElement = aiChatBox.querySelector(".ai-chat-area");

    let RequestOption = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "contents": [{ "parts": [{ "text": user.data }] }]
        })
    };

    try {
        let response = await fetch(Api_Url, RequestOption);
        let data = await response.json();
        // Correctly extracting the text from the API response
        aiTextElement.innerText = data.candidates[0].content.parts[0].text;
    } catch (error) {
        aiTextElement.innerText = "Error: Could not fetch response.";
    } finally {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

function createChatBox(html, classes) {
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}

function handlechatResponse(message) {
    if (!message) return;
    user.data = message;
    
    let userHtml = `<img src="user.png" id="userImage" width="40">
                    <div class="user-chat-area">${message}</div>`;
    chatContainer.appendChild(createChatBox(userHtml, "user-chat-box"));
    prompt.value = "";
    chatContainer.scrollTop = chatContainer.scrollHeight;

    setTimeout(() => {
        let aiHtml = `<img src="ai.jpg" id="aiImage" width="50">
                      <div class="ai-chat-area">
                        <img src="loading.gif" class="load" width="30px">
                      </div>`;
        let aiChatBox = createChatBox(aiHtml, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);
        generateResponse(aiChatBox);
    }, 600);
}

// Event Listeners
prompt.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handlechatResponse(prompt.value.trim());
});

imagebtn.addEventListener("click", () => imagebtn.querySelector("input").click());

imagebtn.querySelector("input").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            let imgHtml = `<img src="user.png" id="userImage" width="40">
                           <div class="user-chat-area"><img src="${event.target.result}" style="max-width:100%; border-radius:10px;"></div>`;
            chatContainer.appendChild(createChatBox(imgHtml, "user-chat-box"));
            chatContainer.scrollTop = chatContainer.scrollHeight;
        };
        reader.readAsDataURL(file);
    }
});

// Voice Logic
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    micBtn.onclick = () => {
        recognition.start();
        micBtn.classList.add("active");
    };
    recognition.onresult = (e) => {
        prompt.value = e.results[0][0].transcript;
        micBtn.classList.remove("active");
    };
    recognition.onend = () => micBtn.classList.remove("active");
}