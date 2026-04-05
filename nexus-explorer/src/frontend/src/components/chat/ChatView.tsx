import { Component, createSignal, createEffect, For, onMount, Show } from "solid-js";
import { activeDb, nodes, edges } from "../../stores/app";
import { nqlExecute } from "../../lib/api";
import "./ChatView.css";

interface Message {
  role: "user" | "assistant";
  content: string;
  data?: any;
  timestamp: number;
}

const suggestions = [
  "What data do I have?",
  "Show me all items",
  "How many connections are there?",
  "What types of items exist?",
];

const ChatView: Component = () => {
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [input, setInput] = createSignal("");
  const [isLoading, setIsLoading] = createSignal(false);
  let messagesEnd: HTMLDivElement | undefined;

  const scrollToBottom = () => {
    messagesEnd?.scrollIntoView({ behavior: "smooth" });
  };

  createEffect(() => {
    scrollToBottom();
  });

  const executeQuery = async (query: string) => {
    if (!activeDb()) return;
    setIsLoading(true);
    try {
      const result = await nqlExecute(activeDb()!, query);
      return result;
    } catch (e: any) {
      return { success: false, message: String(e), data: null };
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (text?: string) => {
    const query = text || input();
    if (!query.trim() || !activeDb()) return;

    const userMsg: Message = { role: "user", content: query, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    const result = await executeQuery(query);

    let response = "";
    if (result?.success) {
      const n = result.data?.nodes?.length || 0;
      const e = result.data?.edges?.length || 0;
      response = `I found ${n} item${n !== 1 ? 's' : ''} and ${e} connection${e !== 1 ? 's' : ''} matching your question.`;
      if (n > 0 && n <= 10) {
        response += "\n\nHere they are:\n" + result.data.nodes.map((node: any) => `• ${node.label}`).join('\n');
      }
    } else {
      response = `I couldn't understand that question. Try asking about specific item types like "people", "tasks", or "symptoms".`;
    }

    const assistantMsg: Message = { role: "assistant", content: response, data: result?.data, timestamp: Date.now() };
    setMessages(prev => [...prev, assistantMsg]);
  };

  const handleSuggestion = (suggestion: string) => {
    sendMessage(suggestion);
  };

  // Welcome message
  createEffect(() => {
    if (messages().length === 0 && activeDb()) {
      const n = nodes().length;
      const e = edges().length;
      setMessages([{
        role: "assistant",
        content: `I can see your database has ${n} items and ${e} connections. Ask me anything about your data!`,
        timestamp: Date.now(),
      }]);
    }
  });

  return (
    <div class="chat-view">
      <div class="chat-messages">
        <For each={messages()}>
          {(msg) => (
            <div class={`chat-message ${msg.role}`}>
              <div class="message-avatar">
                {msg.role === "user" ? "👤" : "🤖"}
              </div>
              <div class="message-content">
                <div class="message-text">{msg.content}</div>
                {msg.data && msg.data.nodes && msg.data.nodes.length > 0 && (
                  <div class="message-data">
                    <details>
                      <summary>Show details ({msg.data.nodes.length} items)</summary>
                      <pre>{JSON.stringify(msg.data, null, 2)}</pre>
                    </details>
                  </div>
                )}
              </div>
            </div>
          )}
        </For>
        {isLoading() && (
          <div class="chat-message assistant">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEnd!} />
      </div>

      <div class="chat-input-area">
        <Show when={messages().length <= 1}>
          <div class="chat-suggestions">
            <For each={suggestions}>
              {(s) => (
                <button class="suggestion-btn" onClick={() => handleSuggestion(s)}>
                  {s}
                </button>
              )}
            </For>
          </div>
        </Show>
        <div class="chat-input-row">
          <input
            type="text"
            value={input()}
            onInput={(e) => setInput(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && !isLoading() && sendMessage()}
            placeholder={activeDb() ? "Ask about your data..." : "Connect to a database first"}
            disabled={!activeDb() || isLoading()}
          />
          <button onClick={() => sendMessage()} disabled={!activeDb() || isLoading() || !input().trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
