import {ApiClient, ChatMessage, ModelOptions} from "../types";

import {Settings} from "../../settings/versions";
import {err, ok, Result} from "neverthrow";
import {makeAPIRequest} from "./utils";


class OpenAIApiClient implements ApiClient {
    private readonly apiKey: string;
    private readonly url: string;
    private readonly modelOptions: ModelOptions;
    private readonly model: string;

    static fromSettings(settings: Settings): OpenAIApiClient {
        return new OpenAIApiClient(
            settings.openAIApiSettings.key,
            settings.openAIApiSettings.url,
            settings.openAIApiSettings.model,
            settings.modelOptions
        );
    }

    constructor(
        apiKey: string,
        url: string,
        model: string,
        modelOptions: ModelOptions
    ) {
        this.apiKey = apiKey;
        this.url = url;
        this.modelOptions = modelOptions;
        this.model = model;
    }

    async queryChatModel(messages: ChatMessage[], abortSignal?: AbortSignal): Promise<Result<string, Error>> {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
        };
        const body: any = {
            messages,
            model: this.model,
            temperature: this.modelOptions.temperature,
            top_p: this.modelOptions.top_p,
            frequency_penalty: this.modelOptions.frequency_penalty,
            presence_penalty: this.modelOptions.presence_penalty,
            stream: true,
        }

        if (this.modelOptions.useMaxCompletionTokens) {
            body.max_completion_tokens = this.modelOptions.max_completion_tokens || this.modelOptions.max_tokens;
        } else {
            body.max_tokens = this.modelOptions.max_tokens;
        }

        // Some models (like o1) don't support certain parameters. 
        // If temperature is 1 (default), we can omit it to be safe.
        if (body.temperature === 1) delete body.temperature;
        if (body.top_p === 1) delete body.top_p;
        if (body.frequency_penalty === 0) delete body.frequency_penalty;
        if (body.presence_penalty === 0) delete body.presence_penalty;

        try {
            const response = await fetch(this.url, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
                signal: abortSignal,
            });

            if (!response.ok) {
                const errorData = await response.json();
                return err(new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`));
            }

            const reader = response.body?.getReader();
            if (!reader) {
                return err(new Error("Failed to get response body reader"));
            }

            let fullContent = "";
            const decoder = new TextDecoder();
            let remainder = "";

            while (true) {
                const {done, value} = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, {stream: true});
                const lines = (remainder + chunk).split("\n");
                remainder = lines.pop() || "";

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine || trimmedLine === "data: [DONE]") continue;
                    if (trimmedLine.startsWith("data: ")) {
                        try {
                            const data = JSON.parse(trimmedLine.slice(6));
                            const content = data.choices[0]?.delta?.content || "";
                            fullContent += content;
                        } catch (e) {
                            console.error("Error parsing SSE line", trimmedLine, e);
                        }
                    }
                }
            }

            return ok(fullContent);
        } catch (e) {
            return err(e instanceof Error ? e : new Error(String(e)));
        }
    }

    async checkIfConfiguredCorrectly(): Promise<string[]> {
        const errors: string[] = [];
        if (!this.url) {
            errors.push("OpenAI API url is not set");
        }
        if (errors.length > 0) {
            // api check is not possible without passing previous checks so return early
            return errors;
        }
        const result = await this.queryChatModel([
            {content: "Say hello world and nothing else.", role: "user"},
        ]);

        if (result.isErr()) {
            errors.push(result.error.message);
        }
        return errors;
    }
}

export default OpenAIApiClient;
