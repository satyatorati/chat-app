import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { translateText } from "../lib/translate";
import toast from "react-hot-toast";
import { Languages } from "lucide-react";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
];

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const [lastMessageId, setLastMessageId] = useState(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleLanguageSelect = async (lang) => {
    try {
      setShowLanguageSelect(false);
      if (!messages?.length) return;

      const lastMessage = messages[messages.length - 1];
      if (!lastMessage?.text || lastMessage._id === lastMessageId) return;

      const response = await translateText(lastMessage.text, lang.code);
      if (response?.translatedText) {
        setTranslatedText(response.translatedText);
        setLastMessageId(lastMessage._id);
      }
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error("Translation limit reached for this month");
      } else {
        toast.error("Failed to translate message");
      }
    }
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && (
                <div>
                  <p>{message.text}</p>
                  {message._id === lastMessageId && translatedText && (
                    <p className="text-sm opacity-75 mt-1 italic">
                      {translatedText}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 flex justify-end gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowLanguageSelect(!showLanguageSelect)}
            className="btn btn-circle btn-sm"
            title="Translate"
          >
            <Languages className="size-4" />
          </button>

          {showLanguageSelect && (
            <div className="absolute bottom-full right-0 mb-2 bg-base-100 rounded-lg shadow-lg p-2 w-48">
              <div className="text-sm font-medium mb-2">Select Language</div>
              <div className="max-h-48 overflow-y-auto">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLanguageSelect(lang)}
                    className="w-full text-left px-2 py-1 rounded text-sm hover:bg-base-200"
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
