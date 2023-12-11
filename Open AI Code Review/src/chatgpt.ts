import tl = require('azure-pipelines-task-lib/task');
import { encode } from 'gpt-tokenizer';
import OpenAI from "openai";

export class ChatGPT {
    private readonly systemMessage: string = '';

    constructor(private _openAi: OpenAI, checkForBugs: boolean = false, checkForPerformance: boolean = false, checkForBestPractices: boolean = false, additionalPrompts: string[] = []) {
        this.systemMessage = `Your task is to act as a code reviewer of a Pull Request:
        - Use bullet points if you have multiple comments.
        ${checkForBugs ? '- If there are any bugs, highlight them.' : null}
        ${checkForPerformance ? '- If there are major performance problems, highlight them.' : null}
        ${checkForBestPractices ? '- Provide details on missed use of best-practices.' : null}
        ${additionalPrompts.length > 0 ? additionalPrompts.map(str => `- ${str}`).join('\n') : null}
        - Do not highlight minor issues and nitpicks.
        - Only provide instructions for improvements 
        - If you have no instructions respond with NO_COMMENT only, otherwise provide your instructions.
    
        You are provided with the code changes (diffs) in a unidiff format.
        
        The response should be in markdown format.`
    }

    public async PerformCodeReview(diff: string, fileName: string): Promise<string> {

        let model = tl.getInput('ai_model', true) as | (string & {})
            | 'gpt-4-1106-preview'
            | 'gpt-4-vision-preview'
            | 'gpt-4'
            | 'gpt-4-0314'
            | 'gpt-4-0613'
            | 'gpt-4-32k'
            | 'gpt-4-32k-0314'
            | 'gpt-4-32k-0613'
            | 'gpt-3.5-turbo-1106'
            | 'gpt-3.5-turbo'
            | 'gpt-3.5-turbo-16k'
            | 'gpt-3.5-turbo-0301'
            | 'gpt-3.5-turbo-0613'
            | 'gpt-3.5-turbo-16k-0613';

        if (!this.doesMessageExceedTokenLimit(diff + this.systemMessage, 4097)) {
            let openAi = await this._openAi.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: this.systemMessage
                    },
                    {
                        role: 'user',
                        content: diff
                    }
                ], model: model
            });

            let response = openAi.choices;

            if (response.length > 0) {
                return response[0].message.content!;
            }
        }

        tl.warning(`Unable to process diff for file ${fileName} as it exceeds token limits.`)
        return '';
    }

    private doesMessageExceedTokenLimit(message: string, tokenLimit: number): boolean {
        let tokens = encode(message);
        return tokens.length > tokenLimit;
    }

}