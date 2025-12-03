import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function detectNameMentions(
  transcriptText: string,
  nameToDetect: string
): Promise<{ mentioned: boolean; context: string[]; confidence: number }> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are analyzing a meeting transcript to detect if a specific name is mentioned.

Name to detect: "${nameToDetect}"
Transcript text:
"""
${transcriptText}
"""

Task:
1. Determine if "${nameToDetect}" or any variations of this name are mentioned in the transcript
2. If mentioned, extract the relevant context (the sentence or paragraph where it appears)
3. Provide a confidence score (0-100)

Consider variations like:
- First name only
- Last name only
- Full name
- Nicknames
- Common misspellings

Respond ONLY with a valid JSON object in this exact format:
{
  "mentioned": true/false,
  "contexts": ["array of relevant sentences where the name appears"],
  "confidence": 0-100
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse Gemini response:', text);
      return { mentioned: false, context: [], confidence: 0 };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      mentioned: parsed.mentioned || false,
      context: parsed.contexts || [],
      confidence: parsed.confidence || 0
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    // Fallback to simple string matching
    const lowerTranscript = transcriptText.toLowerCase();
    const lowerName = nameToDetect.toLowerCase();
    const mentioned = lowerTranscript.includes(lowerName);
    
    return {
      mentioned,
      context: mentioned ? ['Name detected (fallback method)'] : [],
      confidence: mentioned ? 50 : 0
    };
  }
}

export async function analyzeTranscriptEntries(
  entries: Array<{ text: string; participant: string; startTime: string }>,
  nameToDetect: string
): Promise<Array<{ entry: any; mentioned: boolean; context: string; confidence: number }>> {
  const results = [];
  
  for (const entry of entries) {
    const detection = await detectNameMentions(entry.text, nameToDetect);
    
    if (detection.mentioned) {
      results.push({
        entry,
        mentioned: true,
        context: detection.context[0] || entry.text,
        confidence: detection.confidence
      });
    }
  }
  
  return results;
}
