import tl = require('azure-pipelines-task-lib/task');
import { OpenAI } from 'openai';
import { ChatGPT } from './chatgpt';
import { Repository } from './repository';
import { PullRequest } from './pullrequest';

export class Main {
    private static _chatGpt: ChatGPT;
    private static _repository: Repository;
    private static _pullRequest: PullRequest;

    public static async Main(): Promise<void> {
        if (tl.getVariable('Build.Reason') !== 'PullRequest') {
            tl.setResult(tl.TaskResult.Skipped, "This task must only be used when triggered by a Pull Request.");
            return;
        }

        if(!tl.getVariable('System.AccessToken')) {
            tl.setResult(tl.TaskResult.Failed, "'Allow Scripts to Access OAuth Token' must be enabled. See https://learn.microsoft.com/en-us/azure/devops/pipelines/build/options?view=azure-devops#allow-scripts-to-access-the-oauth-token for more information");
            return;
        }

        const apiKey = tl.getInput('api_key', true)!;
        const fileExtensions = tl.getInput('file_extensions', false);
        const filesToExclude = tl.getInput('file_excludes', false);
        const additionalPrompts = tl.getInput('additional_prompts', false)?.split(',')
        
        this._chatGpt = new ChatGPT(new OpenAI({ apiKey: apiKey }), tl.getBoolInput('bugs', true), tl.getBoolInput('performance', true), tl.getBoolInput('best_practices', true), additionalPrompts);
        this._repository = new Repository();
        this._pullRequest = new PullRequest();

        await this._pullRequest.DeleteComments();

        let filesToReview = await this._repository.GetChangedFiles(fileExtensions, filesToExclude);

        tl.setProgress(0, 'Performing Code Review');

        for (let index = 0; index < filesToReview.length; index++) {
            const fileToReview = filesToReview[index];
            let diff = await this._repository.GetDiff(fileToReview);
            let review = await this._chatGpt.PerformCodeReview(diff, fileToReview);

            if(review.indexOf('NO_COMMENT') < 0) {
                await this._pullRequest.AddComment(fileToReview, review);
            }

            console.info(`Completed review of file ${fileToReview}`)

            tl.setProgress((fileToReview.length / 100) * index, 'Performing Code Review');
        }

        tl.setResult(tl.TaskResult.Succeeded, "Pull Request reviewed.");
    }
}

Main.Main();