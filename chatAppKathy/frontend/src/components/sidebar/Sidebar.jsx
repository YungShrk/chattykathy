import { useState } from "react";
import Conversations from "./Conversations";
import LogoutButton from "./LogoutButton";
import SearchInput from "./SearchInput";
import useCreateGroupChat from "../../hooks/useCreateGroupChat";
import toast from "react-hot-toast";

const Sidebar = () => {
	const [groupName, setGroupName] = useState("");
	const [participants, setParticipants] = useState([]);
	const { createGroupChat, loading } = useCreateGroupChat();

	const isValidObjectId = (id) => {
		return /^[0-9a-fA-F]{24}$/.test(id);
	};

	const handleCreateGroupChat = async () => {
		if (!groupName) {
			toast.error("Group name is required");
			return;
		}
		const trimmedParticipants = participants.map((id) => id.trim());
		const invalidIds = trimmedParticipants.filter((id) => !isValidObjectId(id));
		if (invalidIds.length > 0) {
			toast.error(`Invalid participant IDs: ${invalidIds.join(", ")}`);
			return;
		}
		await createGroupChat(groupName, trimmedParticipants);
		setGroupName("");
		setParticipants([]);
	};

	return (
		<div className='border-r border-slate-500 p-4 flex flex-col'>
			<SearchInput />
			<div className='divider px-3'></div>
			<Conversations />
			<div className='flex flex-col mt-4'>
				<input
					type="text"
					placeholder="Group Name"
					value={groupName}
					onChange={(e) => setGroupName(e.target.value)}
					className="input input-bordered mb-2"
				/>
				<input
					type="text"
					placeholder="Participants (comma separated user IDs)"
					value={participants.join(", ")}
					onChange={(e) => setParticipants(e.target.value.split(",").map(id => id.trim()))}
					className="input input-bordered mb-2"
				/>
				<button onClick={handleCreateGroupChat} disabled={loading} className="btn btn-primary">Create Group Chat</button>
			</div>
			<LogoutButton />
		</div>
	);
};

export default Sidebar;
