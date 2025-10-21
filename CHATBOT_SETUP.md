# AI Chatbot Setup with Google Gemini

This guide will help you set up the AI-powered chatbot using Google Gemini.

## Features

- **Google Gemini AI** - Natural language understanding
- **Context-aware conversations** - Remembers conversation history
- **Fallback responses** - Works even without API key
- **Smart navigation** - Can direct users to relevant pages
- **Real-time responses** - Instant AI-powered help

## Setup Instructions

### 1. Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy your API key

### 2. Add API Key to Backend

#### For Local Development:
1. Open `Resi_Backend/.env`
2. Add this line:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

#### For Vercel Production:
1. Go to your Vercel dashboard
2. Select your backend project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** Your actual API key
   - **Environment:** Production, Preview, Development
5. Click **Save**
6. Redeploy your backend

### 3. Test the Chatbot

1. Start your backend: `npm start`
2. Start your frontend: `npm run dev`
3. Click the **Help** button (bottom-right corner)
4. Try asking questions like:
   - "How does ResiLinked work?"
   - "How do I post a job?"
   - "How can I report a scammer?"
   - "What are the safety features?"

### 4. How It Works

#### With Gemini API Key:
- User sends message → Backend calls Gemini AI → AI generates contextual response
- Conversations are context-aware (AI remembers previous messages)
- Responses are natural and intelligent

#### Without Gemini API Key (Fallback):
- Backend uses pattern-matching fallback responses
- Still helpful but not as intelligent
- Works offline

### 5. Customization

#### Modify AI Behavior:
Edit `controllers/chatbotController.js` - Change the `systemPrompt` to adjust:
- Tone and personality
- Response length
- Available features to mention
- Navigation suggestions

#### Adjust Response Length:
In `chatbotController.js`, modify the Gemini model settings:
```javascript
const model = genAI.getGenerativeModel({ 
  model: 'gemini-pro',
  generationConfig: {
    maxOutputTokens: 200, // Shorter responses
    temperature: 0.7      // Creativity level
  }
});
```

### 6. Rate Limits & Costs

**Google Gemini Free Tier:**
- 60 requests per minute
- 1,500 requests per day
- FREE up to these limits

**If you exceed limits:**
- Fallback responses automatically activate
- No errors shown to users
- Consider upgrading to paid tier

### 7. Troubleshooting

**Chatbot always uses fallback responses:**
- Check if `GEMINI_API_KEY` is set correctly
- Verify API key is valid at [Google AI Studio](https://makersuite.google.com/)
- Check backend logs for errors

**"API key not configured" error:**
- Make sure `.env` file has `GEMINI_API_KEY`
- Restart backend after adding API key
- For Vercel, redeploy after adding environment variable

**Slow responses:**
- Gemini AI typically responds in 1-3 seconds
- Network speed affects response time
- Consider showing typing indicator (already implemented)

### 8. Alternative: Dialogflow Setup (Optional)

If you prefer Google Dialogflow instead:

1. Go to [Dialogflow Console](https://dialogflow.cloud.google.com/)
2. Create a new agent
3. Get your service account credentials
4. Install: `npm install @google-cloud/dialogflow`
5. Update `chatbotController.js` to use Dialogflow SDK

The current implementation uses **Gemini** because it's:
- Easier to set up (just API key)
- More flexible (no need to define intents)
- Better at natural language understanding
- Free tier is generous

### 9. Features Included

✅ Natural language processing with Gemini AI
✅ Conversation history context (last 5 messages)
✅ Automatic fallback responses
✅ Typing indicator while AI thinks
✅ Action buttons for navigation
✅ Smart response parsing
✅ Error handling
✅ Mobile responsive

### 10. Example Conversations

**User:** "How do I find work on ResiLinked?"
**AI:** "To find work on ResiLinked, follow these steps:
1. Complete your profile with your skills
2. Go to the job search page
3. Use filters to find relevant jobs
4. Apply to positions that match your skills
Would you like me to take you to the job search page?"

**User:** "Someone is scamming me"
**AI:** "I'm sorry you're experiencing this. To report a scammer:
1. Visit their profile
2. Click the Report button
3. Select 'Scam' as the reason
4. Provide details about what happened
Our admin team reviews reports within 24-48 hours. Would you like to submit a support ticket for immediate assistance?"

---

## Need Help?

- Check backend console for detailed logs
- Look for emoji logs: 🤖 (AI response), ❌ (errors)
- Test with Postman: `POST /api/chatbot/query`
- Contact support if issues persist

**Enjoy your AI-powered chatbot! 🤖✨**
