import fs from "fs";
import path from "path";
import { mistral } from "@ai-sdk/mistral";
import { cosineSimilarity, embed, embedMany, generateText } from "ai";

const MODEL = "open-mistral-nemo";
const db: { embedding: number[]; value: string }[] = [];
const essay = fs.readFileSync(path.join(process.cwd(), "public/test.txt"), "utf8");
const chunks = essay
  .split("\n")
  .map((chunk) => chunk.trim())
  .filter((chunk) => chunk.length > 0 && chunk !== "\n");
console.log(chunks.length)
const bashChuncks: string[][] = []

chunks.forEach((chunk) => {
    if (bashChuncks.length > 0 && bashChuncks[bashChuncks.length - 1].length < 100) {
        bashChuncks[bashChuncks.length - 1] = [...bashChuncks[bashChuncks.length - 1], chunk]
    } else {
        bashChuncks.push([chunk])
    }
})


for (const chunk of bashChuncks) {
    console.log(chunk.length)
  const { embeddings } = await embedMany({
    model: mistral.embedding("mistral-embed"),
    values: chunk
  });

  embeddings.forEach((e, i) => {
    db.push({
      embedding: e,
      value: chunk[i]
    });
  });
}

export async function POST(request: Request) {  
    try {
    const data = await request.json();
    console.log(data);
    const input = data.message;
    const { embedding } = await embed({
        model: mistral.embedding("mistral-embed"),
        value: input,
    });

    const context = db
    .map((item) => ({
      document: item,
      similarity: cosineSimilarity(embedding, item.embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3)
    .map((r) => r.document.value)
    .join("\n");

  const { text } = await generateText({
    model: mistral(MODEL),
    prompt: `
    Tu es un expert en droit. Tu dois aider un avocat à préparer sa stratégie pour une affaire spécifique. 
    Pour faire cela, tu te baseras sur la jurisprudence et donc les anciennes affaires similaires.
    Si tu ne trouves pas de similarité, tu dois dire que tu ne peux pas répondre.
    Réponds uniquement en anglais.
    Ne met pas de textes en gras dans tes réponses.
    Essaye de rajouter tout élément important du contexte dans tes réponses comme des clauses de documents, 
    des dates, des noms de personnes, etc.
    Voici une liste d'éléments pertinents de ces affaires:
    \`\`\`Contexte: ${context}\`\`\`
    La question de l'avocat que tu dois aider est la suivante:
    \`\`\`Question: ${input}\`\`\`
    
    Du contexte, extrait une stratégie qui a fonctionné par le passé et démontre les similarités entre les deux affaires et comment l'avocat pourrais préparer sa défense en se basant sur ce précédent.
    Présente cette stratégie de manière claire et concise sous forme d'étapes clés et montre de quelle manière l'avocat peut l'appliquer à la situation actuelle.
    `,
    });
    const { text: contextText } = await generateText({
        model: mistral(MODEL),
        prompt: `
       Tu es un expert en droit. Tu dois aider un avocat à préparer sa stratégie pour une affaire spécifique. 
       Pour faire cela, tu te baseras sur la jurisprudence et donc les anciennes affaires similaires. 
       Réponds uniquement en anglais.
       Ne met pas de textes en gras dans tes réponses.
       Voici des morceaux importants d'une affaire : 
        \`\`\`Contexte: ${context}\`\`\`
       à partir de ces morceaux, essaie d'expliquer très simplement la raison d'être de l'affaire, 
       les parties impliqués et la conclusion.
        `,
    });
    return Response.json({ response: {text, contextText}});
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ response: "An error occurred while processing your request." });
  }
}
