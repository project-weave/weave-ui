"use client";

import { useChat } from "@ai-sdk/react";

type ChatProps = {
  eventData: any; // Ideally use a proper type here
};

export default function Chat({ eventData }: ChatProps) {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    body: {
      eventData
    }
  });
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m) => (
        <div key={m.id} className="whitespace-pre-wrap">
          {m.role === "user" ? "User: " : "AI: "}
          {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit} className="bottom-0 w-full max-w-md mb-8 border border-gray-300 rounded shadow-xl">
        <input className="w-full p-2" value={input} placeholder="Say something..." onChange={handleInputChange} />
      </form>
    </div>
  );
}
