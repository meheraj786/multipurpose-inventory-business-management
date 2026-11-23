import api from "../client";

export type ChatMessageRole = "user" | "assistant" | "system";

export type ChatMessage = {
	role: ChatMessageRole;
	content: string;
};

export type AssistantChatPayload = {
	message: string;
	history?: ChatMessage[];
};

export type AssistantChatResponse = {
	response: string;
};

const chat = async (
	payload: AssistantChatPayload,
): Promise<AssistantChatResponse> => {
	const { data } = await api.post("/assistant/chat", payload);
	return data.data;
};

export const AssistantApiService = {
	chat,
};
