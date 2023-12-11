# OpenAI Code Review DevOps Extension

This DevOps extension integrates with Azure DevOps Pipelines to perform automated code reviews using OpenAI. The extension includes a task that can be added to your pipeline, triggering the code review process on Pull Requests.

## Features

- Automated Code Reviews using OpenAI
- Diff generation for each change in a Pull Request
- Adding OpenAI's code review comments to the Pull Request

## Prerequisites

- [Azure DevOps Account](https://dev.azure.com/)
- OpenAI API Key

## Installation

1. Install the OpenAI Code Review DevOps Extension from the [Azure DevOps Marketplace](https://marketplace.visualstudio.com/azuredevops).

## Usage

1. **Add OpenAI Code Review Task to Your Pipeline:**
   Add the "OpenAI Code Review" task to your pipeline YAML file.

   ```yaml
   trigger:
     branches:
       exclude:
         - '*'

   pr:
     branches:
       include:
         - '*'

   jobs:
   - job: CodeReview
     pool:
       vmImage: 'ubuntu-latest'
     steps:
     - task: OpenAICodeReviewTask@1
       inputs:
         api_key: $(OpenAI_ApiKey)
         ai_model: 'gpt-3.5-turbo'
         bugs: true
         performance: true
         best_practices: true
         file_extensions: 'js,ts,css,html'
         file_excludes: 'file1.js,file2.py,secret.txt'
         additional_prompts: 'Fix variable naming, Ensure consistent indentation, Review error handling approach'

## Issues and Features

If you encounter any issues, have suggestions for improvement, or would like to request new features, please report as a [new issue](https://github.com/a1dancole/OpenAI-Code-Review/issues/new/choose).

## Contributing

If you would like to contribute to the development of this extension, please follow our contribution guidelines.
