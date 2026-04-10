/**
 * 🚀 CAREERMITRA AI - ADVANCED FRONTEND LOGIC
 * Features: Auto-scroll, Typing Animation, Data Validation
 */

// 1. Enter Key Support
document.getElementById("userInput")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") askAI();
});

// 2. Pro Message UI Utility
function appendChatMsg(container, sender, text, className) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-msg ${className} fade-in`;
    msgDiv.innerHTML = `<b>${sender}:</b> ${text}`;
    container.appendChild(msgDiv);
    
    // Smooth Auto-scroll
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
}

// 3. Smart AI Function
async function askAI() {
    const inputField = document.getElementById("userInput");
    const chatBox = document.getElementById("chatBox");
    const prompt = inputField.value.trim();

    if (!prompt) return;

    // Show User Message
    appendChatMsg(chatBox, "You", prompt, "user-bubble");
    inputField.value = ""; // Clear input

    // 4. Loader (Thinking State)
    const loader = document.createElement("div");
    loader.className = "chat-msg ai-bubble loading";
    loader.innerHTML = "<b>AI Assistant:</b> <span class='typing-dot'>🤖 Analysing your query...</span>";
    chatBox.appendChild(loader);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        // PRO TIP: "/api/ai/chat" use karein kyunki humne server.js mein yahi route set kiya hai
        const res = await fetch("/api/ai/chat", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: prompt })
        });

        const data = await res.json();
        loader.remove(); // Loader hatao

        if (data.success) {
            // AI ka response smooth tarike se dikhao
            appendChatMsg(chatBox, "AI Assistant", data.response, "ai-bubble");
        } else {
            throw new Error(data.message || "AI Error");
        }

    } catch (e) {
        loader.className = "chat-msg error-bubble";
        loader.innerHTML = "⚠️ <b>System:</b> Connection failed. Please check if your terminal shows 'MongoDB Connected'.";
        console.error("Connection Error:", e);
    }
}