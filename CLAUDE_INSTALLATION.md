# Claude Models Installation Guide

## Overview

I've added two Claude models to your application:
1. **Claude 3 Haiku** - Fast and efficient for everyday tasks
2. **Claude 3.7 Sonnet** - Advanced reasoning for complex tasks

## Installation Instructions

1. **Install the Anthropic package with legacy peer deps**:

```bash
cd /Users/amrehab/Downloads/wizzo-vercel-code
npm install --legacy-peer-deps @ai-sdk/anthropic
```

2. **If you encounter errors during installation**, try:

```bash
npm install --force @ai-sdk/anthropic
```

3. **Restart your Next.js development server** after installing the package:

```bash
# Stop your current server with Ctrl+C
# Then restart it
npm run dev
```

## What Changes Were Made

1. Added Anthropic provider in `lib/ai/models.ts`
2. Added Claude models to the language models configuration
3. Added Claude models to the model selector dropdown
4. Modified system prompts in `lib/ai/prompts.ts` to be compatible with Claude
5. Updated knowledge context handling in the chat API route to work with Claude's requirements

## Troubleshooting

If you encounter the "Multiple system messages" error:
- This is fixed by the changes to `route.ts` which modifies how knowledge context is provided to Claude models
- Claude has stricter requirements for system messages than OpenAI models
- The implementation now uses user messages for context with Claude models

If the models don't appear in the dropdown:
- Make sure the Anthropic package is installed
- Check the browser console for any errors
- Restart your development server

## Using the Claude Models

1. Start a new chat
2. Click on the model selector dropdown in the upper left of the chat interface 
3. Select either "Claude 3 Haiku" or "Claude 3.7 Sonnet"
4. Start chatting as normal

Claude models are particularly good at:
- Creative writing and nuanced responses
- Complex reasoning tasks
- Long-form content generation

Note that Claude may handle some prompts differently than OpenAI models, so you might notice some differences in response style and capabilities.
