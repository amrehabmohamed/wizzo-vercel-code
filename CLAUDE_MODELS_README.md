# Claude Models Integration

This document explains the steps to integrate Claude models into the WIZZO application.

## Added Models

Two Claude models have been added to the application:

1. **Claude 3 Haiku** (claude-3-haiku-20240307)
   - Fast and efficient for everyday tasks
   - Good for quick responses and simpler queries

2. **Claude 3.7 Sonnet** (claude-3-7-sonnet-20250219)
   - Advanced reasoning for complex tasks
   - More powerful for detailed analysis and complex problems

## Installation Steps

To complete the integration of Claude models, you need to install the Anthropic provider package:

```bash
# Navigate to your project directory
cd /Users/amrehab/Downloads/wizzo-vercel-code

# Install the Anthropic provider
npm install @ai-sdk/anthropic
```

Alternatively, you can run the install script:

```bash
# Make the script executable
chmod +x install-anthropic.sh

# Run the script
./install-anthropic.sh
```

## Configuration

The models are already configured in the application. The implementation follows the same pattern as the existing OpenAI models:

1. The models are defined in `lib/ai/models.ts`
2. They use the same prompt templates as other models
3. They appear in the model selector dropdown in the UI

## Authentication

The application uses the ANTHROPIC_API_KEY from your .env.local file for authentication. Make sure this key is valid and has access to the specified Claude models.

## Usage

After installation, you'll be able to select Claude models from the dropdown menu in the chat interface, giving you a total of 4 model options:

- GPT-4o Mini
- GPT-o3 Mini
- Claude 3 Haiku
- Claude 3.7 Sonnet

Simply select the desired model from the dropdown and start chatting.
