import { useState } from "react";
import toast from "react-hot-toast";
import useConversation from "../zustand/useConversation";

const useDeleteChat = () => {
    const [loading, setLoading] = useState(false);
    const { conversations, setConversations, selectedConversation, setSelectedConversation } = useConversation();

    const deleteChat = async (conversationId) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/messages/${conversationId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setConversations(conversations.filter(convo => convo._id !== conversationId));
            if (selectedConversation?._id === conversationId) {
                setSelectedConversation(null);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return { deleteChat, loading };
};

export default useDeleteChat;
