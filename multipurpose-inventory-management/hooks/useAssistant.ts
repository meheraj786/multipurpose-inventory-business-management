import { useMutation } from "@tanstack/react-query";
import {
	AssistantApiService,
	type AssistantChatPayload,
	type AssistantChatResponse,
} from "@/lib/api/services/assistant.service";

const ASSISTANT_KEY = "assistant";

export const useChatWithAssistant = () => {
	return useMutation<AssistantChatResponse, Error, AssistantChatPayload>({
		mutationKey: [ASSISTANT_KEY, "chat"],
		mutationFn: (payload: AssistantChatPayload) =>
			AssistantApiService.chat(payload),
	});
};

export type {
	AssistantChatPayload,
	AssistantChatResponse,
	ChatMessage,
	ChatMessageRole,
} from "@/lib/api/services/assistant.service";
