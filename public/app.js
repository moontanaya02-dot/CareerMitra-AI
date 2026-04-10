/**
 * 🚀 PRO LEVEL FRONTEND CONTROLLER
 * Handles AI Chat interactions with polished UI updates.
 */

async function sendMessage() {
    const inputElement = document.getElementById("userInput");
    const chatBox = document.getElementById("chatBox");
    const message = inputElement.value.trim();

    // 1. Validation: Khali message mat bhejo
    if (!message) return;

    // 2. Clear input & disable (User experience)
    inputElement.value = "";
    inputElement.disabled = true;

    // 3. Append User Message with Style
    const userDiv = document.createElement("div");
    userDiv.className = "user-msg-container"; // CSS mein style add kar sakte hain
    userDiv.innerHTML = `<p class="message-text"><b>You:</b> ${message}</p>`;
    chatBox.appendChild(userDiv);

    // 4. Loading Indicator
    const loadingDiv = document.createElement("div");
    loadingDiv.id = "ai-loading";
    loadingDiv.innerHTML = `<p style="color: #6366f1; font-style: italic;">✨ Career AI is typing...</p>`;
    chatBox.appendChild(loadingDiv);
    
    // Auto-scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        // 5. API Call (Note: Port 3000 use karein jo hamare server ka hai)
        const response = await fetch("/api/ai/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt: message })
        });

        const data = await response.json();

        // Remove loading indicator
        document.getElementById("ai-loading").remove();

        // 6. Append AI Response
        const aiDiv = document.createElement("div");
        aiDiv.className = "ai-msg-container";
        
        if (data.success) {
            aiDiv.innerHTML = `<p class="message-text ai-text"><b>AI Assistant:</b> ${data.response}</p>`;
        } else {
            aiDiv.innerHTML = `<p class="message-text error-text"><b>AI:</b> ⚠️ Oops! I'm having trouble thinking. Try again?</p>`;
        }
        
        chatBox.appendChild(aiDiv);

    } catch (error) {
        console.error("Frontend Error:", error);
        if(document.getElementById("ai-loading")) document.getElementById("ai-loading").remove();
        chatBox.innerHTML += `<p style="color: red;"><b>System:</b> Connection failed. Is the server running?</p>`;
    } finally {
        // 7. Re-enable input
        inputElement.disabled = false;
        inputElement.focus();
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

// Pro Tip: 'Enter' key support add karein
document.getElementById("userInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});