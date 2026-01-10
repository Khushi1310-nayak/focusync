
import { GoogleGenAI } from "@google/genai";
import { ChatMessage, Session, Mood, UserProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const BASE_SYSTEM_INSTRUCTION = `
You are FOCUSYNC Coach, an intelligent, high-EQ productivity companion for software developers.
Your goal is to help them code effectively while avoiding burnout.

Behavioral Guidelines:
1. **Be Concise & Structured**: Developers like clean, readable answers. Use bullet points and bold text for key insights.
2. **Visual Formatting**:
   - Use **bold** for emphasis on important terms or stats.
   - Use lists for steps or suggestions.
   - Use code blocks only when providing code.
   - Do NOT use heavy markdown headers (#) unless necessary for long explanations.
3. **Tone**: Empathetic, professional, but casual (like a senior tech lead). Use occasional emojis (🌿, ⚡, 🧠) to lighten the mood but don't overdo it.
4. **Context Aware**: Reference their specific stats (hours, stack, mood) to make the advice feel personal.

Safety & Ethics:
- Prioritize mental health over productivity.
- If the user is exhausted, insist on rest.
- Never be "hustle-toxic".
`;

const DEBUG_SYSTEM_INSTRUCTION = `
MODE: DEBUG EXPERT
1. Identify bugs/issues instantly.
2. Provide the corrected code in a code block.
3. Briefly explain the fix using bullet points.
4. Focus on performance and clean code practices.
`;

export interface GenerationOptions {
  attachment?: {
    mimeType: string;
    data: string; // Base64 for images/pdf, Raw Text for text files
  };
  mode: 'normal' | 'debug' | 'thinking';
}

export const generateCoachResponse = async (
  history: ChatMessage[],
  sessions: Session[],
  moods: { date: string; mood: Mood }[],
  userProfile: UserProfile,
  currentMessage: string,
  options: GenerationOptions = { mode: 'normal' }
): Promise<string> => {
  try {
    // Construct a context string from user data
    const today = new Date().toDateString();
    const todaySessions = sessions.filter(s => new Date(s.timestamp).toDateString() === today);
    const totalTodaySeconds = todaySessions.reduce((acc, curr) => acc + curr.duration, 0);
    const hours = Math.floor(totalTodaySeconds / 3600);
    const minutes = Math.floor((totalTodaySeconds % 3600) / 60);

    const recentMood = moods.length > 0 ? moods[moods.length - 1].mood : "Unknown";

    let profileContext = `
      [User Profile]
      Name: ${userProfile.name}
      Role: ${userProfile.role}
      Primary Field: ${userProfile.field}
      Current Focus: ${userProfile.currentFocus}
      Student Status: ${userProfile.isStudent ? 'Yes' : 'No'}
    `;

    if (userProfile.isStudent && userProfile.education) {
      profileContext += `\nEducation: ${userProfile.education.degree} at ${userProfile.education.university}.`;
    } else if (userProfile.work) {
      profileContext += `\nWork: ${userProfile.work.title} at ${userProfile.work.company} (${userProfile.work.type}).`;
    }

    let context = `
      ${profileContext}
      [Current Stats]
      Date: ${today}
      Coding Time Today: ${hours}h ${minutes}m.
      Recent Mood: ${recentMood}.
      Session Count Today: ${todaySessions.length}.
    `;

    // Determine Model and Config
    let model = 'gemini-3-flash-preview';
    let systemInstruction = BASE_SYSTEM_INSTRUCTION + context;
    const tools: any[] = [];

    // Mode Specific Configs
    if (options.mode === 'debug') {
      systemInstruction += "\n" + DEBUG_SYSTEM_INSTRUCTION;
    } 
    
    if (options.mode === 'thinking') {
      // Use search grounding for "Thinking"
      tools.push({ googleSearch: {} });
    }

    if (options.attachment?.mimeType.startsWith('image/')) {
      // Switch to an image-capable model specifically if it's an image
      // Note: gemini-3-flash-preview is also multimodal but 2.5 is often optimized for vision tasks in current prompt constraints
      model = 'gemini-2.5-flash-image';
    }

    // Map history to Gemini format
    const chatHistory = history.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    }));

    // Prepare current message content
    let contents: any = { role: 'user', parts: [] };
    
    if (options.attachment) {
      if (options.attachment.mimeType === 'text/plain') {
          // Append Text Content directly
          contents.parts.push({
             text: `[Attached File Content]:\n${options.attachment.data}\n\n`
          });
      } else {
         // Handle Base64 (Image or PDF)
         const base64Data = options.attachment.data.includes(',') 
             ? options.attachment.data.split(',')[1] 
             : options.attachment.data;
             
         contents.parts.push({
           inlineData: {
             mimeType: options.attachment.mimeType, 
             data: base64Data
           }
         });
      }
    }
    
    contents.parts.push({ text: currentMessage });

    // Initiate Chat
    if (options.attachment?.mimeType.startsWith('image/')) {
       // For Images, we use generateContent style via chat or direct prompt
       // Using chat.sendMessage with parts works for 2.5-flash-image
       const chat = ai.chats.create({
        model: model,
        history: chatHistory
       });
       
       const result = await chat.sendMessage({ 
         message: contents.parts 
       });
       return result.text || "I see the image. How can I help with it?";
    } else {
        // Normal / PDF / Text Mode
        const chat = ai.chats.create({
            model: model,
            config: {
              systemInstruction: systemInstruction,
              tools: tools.length > 0 ? tools : undefined,
            },
            history: chatHistory
          });
      
          const result = await chat.sendMessage({ message: contents.parts });
          
          let responseText = result.text || "I'm here to support you. Take a deep breath. 🌿";
          
          if (result.candidates?.[0]?.groundingMetadata?.groundingChunks) {
             const sources = result.candidates[0].groundingMetadata.groundingChunks
               .map((c: any) => c.web?.uri)
               .filter((u: string) => u);
             
             if (sources.length > 0) {
                 responseText += `\n\n**Sources found:**\n${sources.slice(0, 3).map((s: string) => `- ${s}`).join('\n')}`;
             }
          }
          
          return responseText;
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to my neural network right now. But remember to stay hydrated! 💧";
  }
};
