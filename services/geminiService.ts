

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { type Person, formatName, type People, type ResearchResult } from '../types';

// The execution environment is expected to have the API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateBio = async (person: Person, people: People): Promise<string> => {
  const { name, birthDate, deathDate, spouseId, fatherId, motherId, isAdopted, birthFatherId, birthMotherId } = person;

  let facts = `Facts about ${formatName(person)}:\n`;
  if (birthDate) facts += `- Born: ${birthDate}\n`;
  if (deathDate) facts += `- Died: ${deathDate}\n`;

  const spouse = spouseId ? people[spouseId] : null;
  if (spouse) {
    facts += `- Spouse: ${formatName(spouse)}\n`;
  }

  const father = fatherId ? people[fatherId] : null;
  const mother = motherId ? people[motherId] : null;
  const birthFather = birthFatherId ? people[birthFatherId] : null;
  const birthMother = birthMotherId ? people[birthMotherId] : null;

  if (isAdopted) {
      const adoptiveParents = [father, mother].filter((p): p is Person => !!p);
      if (adoptiveParents.length > 0) {
          const parentNames = adoptiveParents.map(p => p.name.first).join(' and ');
          facts += `- Adoptive Parents: ${parentNames}\n`;
      }

      const biologicalParents = [birthFather, birthMother].filter((p): p is Person => !!p);
      if (biologicalParents.length > 0) {
          const parentNames = biologicalParents.map(p => p.name.first).join(' and ');
          facts += `- Birth Parents: ${parentNames}\n`;
      }
  } else {
      const parents = [father, mother].filter((p): p is Person => !!p);
      if (parents.length > 0) {
          const parentNames = parents.map(p => p.name.first).join(' and ');
          facts += `- Parents: ${parentNames}\n`;
      }
  }

  const siblings = Object.values(people).filter(p => {
    if (p.id === person.id) return false;
    // Siblings share at least one legal parent.
    const sharesFather = person.fatherId && p.fatherId === person.fatherId;
    const sharesMother = person.motherId && p.motherId === person.motherId;
    return !!(sharesFather || sharesMother);
  });

  if (siblings.length > 0) {
    const siblingNames = siblings.map(s => s.name.first).join(', ');
    facts += `- Siblings: ${siblingNames}\n`;
  }

  const children = Object.values(people).filter(p => p.fatherId === person.id || p.motherId === person.id);
  if (children.length > 0) {
    const childrenNames = children.map(c => formatName(c)).join(', ');
    facts += `- Children: ${childrenNames}\n`;
  }

  const prompt = `Based on the following facts, write a concise, one-paragraph biography for ${formatName(person)}.
Combine the facts into a smooth, narrative-style paragraph. Stick only to the information provided. Do not invent any new details.

${facts}`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 0.2, // Lower temperature for more factual, less creative output
            topP: 1,
            topK: 32,
        },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating biography:", error);
    return "Could not generate a biography at this time. Please check the API key and network connection.";
  }
};


export const researchPerson = async (query: string): Promise<ResearchResult> => {
    const systemInstruction = "You are a helpful genealogy research assistant. Based on the user's query, find relevant historical records, obituaries, or other genealogical information using Google Search. Summarize the findings and provide the source links.";

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: query,
            config: {
                systemInstruction: systemInstruction,
                tools: [{ googleSearch: {} }],
            },
        });

        const summary = response.text;
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

        const sources = groundingMetadata?.groundingChunks
            ?.map((chunk: any) => chunk.web)
            .filter((web): web is { uri: string; title: string } => web && web.uri && web.title)
            .reduce((acc: { uri: string; title: string }[], current) => {
                if (!acc.find(item => item.uri === current.uri)) {
                    acc.push(current);
                }
                return acc;
            }, [] as { uri: string; title: string }[]) || [];

        return { summary, sources };
    } catch (error) {
        console.error("Error researching person:", error);
        return {
            summary: "Could not perform research at this time. Please check your network connection or API key.",
            sources: [],
        };
    }
};