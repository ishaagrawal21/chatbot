const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const generateAIResponse = async (userMessage: string, chatHistory: any[]): Promise<string> => {
  if (OPENAI_API_KEY) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful customer support assistant. Be friendly, concise, and helpful.",
            },
            ...chatHistory
              .slice(-5)
              .map((msg) => ({
                role: msg.sender === "user" ? "user" : "assistant",
                content: msg.content,
              })),
            {
              role: "user",
              content: userMessage,
            },
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      return data.choices[0]?.message?.content || getFallbackResponse(userMessage);
    } catch (error) {
      console.log("OpenAI API error:", error);
      return getFallbackResponse(userMessage);
    }
  } else {
    return getFallbackResponse(userMessage);
  }
};

const getFallbackResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase();

  if (message.includes("hello") || message.includes("hi") || message.includes("hey")) {
    return "Hello! How can I help you today?";
  }

  if (message.includes("help")) {
    return "I'm here to help! What do you need assistance with?";
  }

  if (message.includes("thank")) {
    return "You're welcome! Is there anything else I can help you with?";
  }

  if (message.includes("bye") || message.includes("goodbye")) {
    return "Goodbye! Have a great day!";
  }

  if (message.includes("price") || message.includes("cost")) {
    return "For pricing information, please contact our sales team. They'll be happy to assist you!";
  }

  if (message.includes("support") || message.includes("contact")) {
    return "Our support team is available 24/7. You can reach us through this chat or email us at support@example.com";
  }

  return "Thank you for your message. Our team will get back to you shortly. Is there anything specific you'd like to know?";
};

