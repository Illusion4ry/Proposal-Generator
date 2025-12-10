import { GoogleGenAI } from "@google/genai";
import { FirmData, ProposalContent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are a top-tier Sales Engineer for TaxDome, a practice management platform for accounting firms. 
Your goal is to generate a high-converting, professional Executive Summary and Pricing Quote.
The tone should be professional, empathetic, and persuasive.
You MUST use the 'googleSearch' tool to find the current pricing for TaxDome (specifically looking for the User's selected plan on taxdome.com/pricing).
Always assume standard annual billing unless context suggests otherwise.
IMPORTANT: You must return the final response as a valid JSON object. Do not include markdown formatting or explanations outside the JSON.
`;

export const generateProposal = async (data: FirmData): Promise<ProposalContent> => {
  const prompt = `
    Please generate a sales proposal for a prospective client.
    
    Client Details:
    - Firm Name: ${data.firmName}
    - Contact Person: ${data.contactName}
    - Size: ${data.firmSize} employees
    - Interested in Plan: ${data.selectedPlan}
    - Selected Onboarding Package: ${data.selectedOnboarding.name} (Price: ${data.selectedOnboarding.priceDisplay})
    - Onboarding Features: ${data.selectedOnboarding.features.join(", ")}
    - Key Features Desired: ${data.features.join(", ")}
    
    Additional Context:
    - Discovery Call Transcript: "${data.transcript || "None provided."}"
    - Executive Notes (Private Context): "${data.additionalContext || "None provided."}"
    
    Task:
    1. Search for the CURRENT pricing of the "${data.selectedPlan}" on taxdome.com/pricing.
    2. Create an Executive Summary that addresses the firm's specific needs.
    3. Create a Quote section.
       - Calculate Software Cost = ${data.firmSize} users * [Found Annual Price].
       - Onboarding Cost = ${data.selectedOnboarding.price}.
       - Grand Total = Software Cost + Onboarding Cost.

    OUTPUT FORMAT:
    Return a single JSON object with the following structure. Do not use Markdown code blocks.

    {
      "executiveSummary": {
        "title": "A catchy title for the summary",
        "body": "2-3 paragraphs focusing on their pain points and how TaxDome solves them (HTML tags allowed for formatting)",
        "keyBenefits": ["Benefit 1", "Benefit 2", "Benefit 3"]
      },
      "quote": {
        "planName": "${data.selectedPlan}",
        "pricePerUser": "The found price per user/year (e.g. $800, $1000, $1200)",
        "billingFrequency": "billed annually",
        "softwareTotal": "Calculated total for just the software subscription",
        "onboarding": {
          "name": "${data.selectedOnboarding.name}",
          "price": "${data.selectedOnboarding.priceDisplay}",
          "features": ["List 2-3 key onboarding features"]
        },
        "totalAnnualCost": "Grand total including onboarding (formatted string like $12,999)",
        "featuresList": ["List 5-7 key features included in this plan"],
        "closingStatement": "A strong closing sentence calling them to action."
      }
    }
  `;

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

    // Clean up potential markdown code blocks
    text = text.replace(/```json\n?|```/g, '').trim();

    return JSON.parse(text) as ProposalContent;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate proposal. Please try again.");
  }
};