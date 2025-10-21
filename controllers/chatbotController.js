const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * CHATBOT QUERY
 * Handle chatbot queries using Google Gemini AI
 */
exports.chatbotQuery = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
        alert: 'Please provide a message'
      });
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not configured');
      // Fallback to basic responses
      return res.status(200).json({
        success: true,
        data: {
          response: getFallbackResponse(message),
          source: 'fallback'
        }
      });
    }

    // System prompt that defines the chatbot's behavior
    const systemPrompt = `You are ResiLinked Assistant, a helpful AI chatbot for ResiLinked - a platform that connects workers and employers in local communities.

ABOUT RESILINKED:
- ResiLinked is a job marketplace connecting local workers with employers
- Workers can create profiles, search jobs, and apply to opportunities
- Employers can post jobs, review worker profiles, and hire workers
- Features include chat messaging, ratings/reviews, and job management

YOUR ROLE:
- Help users understand how to use ResiLinked
- Guide them on posting jobs, finding work, managing profiles
- Explain safety features and best practices
- Assist with common issues and questions
- Be friendly, professional, and concise

KEY FEATURES YOU CAN HELP WITH:
1. **For Workers:**
   - Creating and updating profiles
   - Searching and applying for jobs
   - Communicating with employers
   - Building reputation through ratings

2. **For Employers:**
   - Posting job listings
   - Finding and inviting workers
   - Managing applications
   - Rating worker performance

3. **Safety & Support:**
   - Reporting scammers or inappropriate behavior
   - Submitting support tickets
   - Understanding verification process
   - Payment best practices

4. **Common Actions:**
   - Navigate to /search-jobs for finding work
   - Navigate to /post-job for creating listings
   - Navigate to /help for support tickets
   - Navigate to /profile for account settings

RESPONSE GUIDELINES:
- Keep responses concise (2-4 sentences)
- Use bullet points for lists
- Include relevant emojis sparingly
- Suggest specific actions when applicable
- If unsure, direct users to submit a support ticket at /help
- NEVER make up features that don't exist
- If asked about technical issues, suggest contacting support

Respond naturally and helpfully to user questions about ResiLinked.`;

    // Build conversation context
    let conversationText = systemPrompt + '\n\n';
    
    // Add conversation history (last 5 messages for context)
    const recentHistory = conversationHistory.slice(-5);
    recentHistory.forEach(msg => {
      conversationText += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
    
    conversationText += `User: ${message}\nAssistant:`;

    // Generate response using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent(conversationText);
    const response = await result.response;
    const botResponse = response.text();

    console.log('🤖 Gemini AI response generated');

    res.status(200).json({
      success: true,
      data: {
        response: botResponse,
        source: 'gemini'
      }
    });

  } catch (error) {
    console.error('Chatbot query error:', error);
    
    // Fallback to basic responses if AI fails
    const fallbackResponse = getFallbackResponse(req.body.message);
    
    res.status(200).json({
      success: true,
      data: {
        response: fallbackResponse,
        source: 'fallback'
      }
    });
  }
};

/**
 * Fallback responses when AI is not available
 */
function getFallbackResponse(message) {
  const msg = message.toLowerCase();

  // How it works
  if (msg.includes('how') && (msg.includes('work') || msg.includes('use'))) {
    return "ResiLinked connects workers and employers in your local community! 🏘️\n\n📋 **For Workers:** Create your profile, search for jobs, apply to opportunities, and chat with employers.\n\n💼 **For Employers:** Post job listings, review worker profiles, invite workers to jobs, and manage applications.\n\nWhat would you like to know more about?";
  }

  // Report scammer
  if (msg.includes('report') || msg.includes('scam')) {
    return "To report a user:\n1. Go to their profile\n2. Click the 'Report' button\n3. Select the reason and provide details\n\nOur admin team will review within 24-48 hours. Your safety is our priority! 🛡️";
  }

  // Support ticket
  if (msg.includes('support') || msg.includes('ticket') || msg.includes('help') || msg.includes('problem')) {
    return "I can help you submit a support ticket! 🎫\n\nCommon issues we can help with:\n• Account problems\n• Payment issues\n• Profile verification\n• Technical difficulties\n\nVisit /help to create a support ticket.";
  }

  // Find jobs
  if (msg.includes('find') && msg.includes('job')) {
    return "Looking for work? Great! 🎯\n\nTips:\n1. Complete your profile with skills\n2. Add a professional photo\n3. Use search filters effectively\n4. Apply quickly to new postings\n\nVisit /search-jobs to start searching!";
  }

  // Post job
  if (msg.includes('post') && msg.includes('job')) {
    return "Ready to post a job? 📝\n\nBefore posting:\n• Write a clear job title and description\n• Specify required skills\n• Set fair compensation\n• Add job location\n\nVisit /post-job to create your listing!";
  }

  // Safety
  if (msg.includes('safe') || msg.includes('security')) {
    return "Your safety is our priority! 🔒\n\nSafety tips:\n• Verify profiles before hiring\n• Read ratings and reviews\n• Meet in public places first\n• Use in-app messaging\n• Report suspicious behavior\n• Trust your instincts";
  }

  // Payment
  if (msg.includes('pay') || msg.includes('money') || msg.includes('price')) {
    return "💰 ResiLinked is FREE to use!\n\nFor payments between users:\n• Discuss payment terms before starting work\n• Put agreements in writing\n• Use secure payment methods\n• Report payment disputes to support\n\nNeed help with a payment issue? Submit a support ticket at /help";
  }

  // Profile
  if (msg.includes('profile') || msg.includes('account')) {
    return "📱 Managing your profile:\n\n• Update your info anytime at /profile\n• Add skills to match more jobs\n• Upload a profile picture\n• Complete verification for trust\n\nHaving trouble? Submit a support ticket at /help";
  }

  // Default response
  return "I'm here to help! 😊\n\nI can assist you with:\n• How ResiLinked works\n• Finding or posting jobs\n• Reporting issues\n• Safety tips\n• Account help\n\nWhat would you like to know?";
}

module.exports = exports;
