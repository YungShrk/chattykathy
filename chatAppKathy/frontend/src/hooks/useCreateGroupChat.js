import { useState } from "react";
import toast from "react-hot-toast";
import useConversation from "../zustand/useConversation";

const useCreateGroupChat = () => {
    const [loading, setLoading] = useState(false);
    const { conversations, setConversations } = useConversation();

    const createGroupChat = async (groupName, participants) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/messages/group`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ groupName, participants }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setConversations([...conversations, data]);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return { createGroupChat, loading };
};

export default useCreateGroupChat;
