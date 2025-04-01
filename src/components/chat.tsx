"use client";

import { useChat } from "@ai-sdk/react";

type ChatProps = {
  eventData: any; // Ideally use a proper type here
};

export default function Chat({ eventData }: ChatProps) {
  const { handleInputChange, handleSubmit, input, messages } = useChat({
    body: {
      eventData
    }
  });
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m) => (
        <div className="whitespace-pre-wrap" key={m.id}>
          {m.role === "user" ? "User: " : "AI: "}
          {m.content}
        </div>
      ))}

      <form className="bottom-0 w-full max-w-md mb-8 border border-gray-300 rounded shadow-xl" onSubmit={handleSubmit}>
        <input className="w-full p-2" onChange={handleInputChange} placeholder="Say something..." value={input} />
      </form>
    </div>
  );
}
