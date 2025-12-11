import { GoogleGenAI } from "@google/genai";
import { FirmData, ProposalContent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are a top-tier Sales Engineer for TaxDome.
Your goal is to generate a high-converting, professional Executive Summary and Pricing Quote.
Tone: Professional, empathetic, persuasive, and concise.
Search Tool: You MUST use 'googleSearch' to find current pricing for the user's plan on taxdome.com/pricing.
Format: Return ONLY valid JSON. No markdown.
Language: Respect the requested OUTPUT LANGUAGE for all text.
Currency: Ensure ALL prices include the appropriate currency symbol (e.g. $) and use comma separators for thousands (e.g. $1,500).
Quantifiable Results: ALWAYS quantify benefits in solutions using numbers, percentages, or multipliers.
Conciseness: Solutions MUST be short and punchy (under 12 words).
`;

export const DEFAULT_PROMPT_TEMPLATE = `
Please generate a sales proposal for a prospective client.

Client Details:
- Firm Name: {{firmName}}
- Contact Person: {{contactName}}
- Size: {{firmSize}} employees
- Plan: {{selectedPlan}}
- Onboarding: {{onboardingName}} ({{onboardingPrice}})
- Onboarding Features: {{onboardingFeatures}}
- Key Features: {{desiredFeatures}}
- OUTPUT LANGUAGE: {{language}}

Context:
- Transcript: "{{transcript}}"
- Notes: "{{context}}"

Task:
1. Search taxdome.com/pricing for the CURRENT annual price of "{{selectedPlan}}".
2. Create an Executive Summary in {{language}}.
   - Overview: Strictly MAXIMUM 2 sentences. Focus on the core value proposition to save space.
   - Challenges & Solutions: Identify 3 specific pains/problems from the transcript (or imply from features if transcript missing). Map each to a specific TaxDome solution.
     IMPORTANT: 
     - Solution MUST be quantifiable (e.g., "3x faster", "save 10 hrs/week").
     - Solution MUST be concise (max 12 words).
3. Create a Quote in {{language}}.
   - Software = {{firmSize}} * [Found Price].
   - Total = Software + {{onboardingPrice}}.

OUTPUT JSON FORMAT:
{
  "executiveSummary": {
    "title": "A catchy title (in {{language}})",
    "body": "The overview paragraph (MAXIMUM 2 sentences, in {{language}})",
    "challengesAndSolutions": [
      { "problem": "Specific pain point (e.g. 'Chasing clients for documents')", "solution": "Concise, quantifiable solution (e.g. 'Get documents 3x faster with auto-reminders')" },
      { "problem": "...", "solution": "..." },
      { "problem": "...", "solution": "..." }
    ]
  },
  "quote": {
    "planName": "{{selectedPlan}}",
    "pricePerUser": "Price MUST include currency symbol and commas (e.g. $800 or $1,200). DO NOT include '/user' or '/year'.",
    "billingFrequency": "billed annually (in {{language}})",
    "softwareTotal": "Total MUST include currency symbol and commas (e.g. $4,000).",
    "onboarding": {
      "name": "{{onboardingName}} (in {{language}})",
      "price": "{{onboardingPrice}}",
      "features": ["2-3 key onboarding features (in {{language}})"]
    },
    "totalAnnualCost": "Grand total MUST include currency symbol and commas (e.g. $5,999).",
    "featuresList": ["5-7 key features (in {{language}})"],
    "closingStatement": "Exact phrase: 'To get started, please contact Edgar Espinoza at edgar@taxdome.com' (Translated to {{language}} if necessary)."
  }
}
`;

/**
 * Replaces {{variable}} placeholders in the template with actual data.
 */
const hydratePrompt = (template: string, data: FirmData): string => {
  let prompt = template;
  
  const replacements: Record<string, string> = {
    '{{firmName}}': data.firmName,
    '{{contactName}}': data.contactName,
    '{{firmSize}}': data.firmSize.toString(),
    '{{selectedPlan}}': data.selectedPlan,
    '{{onboardingName}}': data.selectedOnboarding.name,
    '{{onboardingPrice}}': data.selectedOnboarding.priceDisplay,
    '{{onboardingFeatures}}': data.selectedOnboarding.features.join(", "),
    '{{desiredFeatures}}': data.features.join(", "),
    '{{language}}': data.language,
    '{{transcript}}': data.transcript || "None provided",
    '{{context}}': data.additionalContext || "None provided"
  };

  Object.entries(replacements).forEach(([key, value]) => {
    prompt = prompt.split(key).join(value);
  });

  return prompt;
};

export const generateProposal = async (data: FirmData, customTemplate?: string): Promise<ProposalContent> => {
  const template = customTemplate || DEFAULT_PROMPT_TEMPLATE;
  const prompt = hydratePrompt(template, data);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
      }
    });

    let text = response.text;
    if (!text) throw new Error("No response from AI");

    text = text.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(text) as ProposalContent;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate proposal. Please try again.");
  }
};