import { Mistral } from '@mistralai/mistralai';


const apiKey = process.env.MISTRAL_API_KEY;

const client = new Mistral({apiKey: apiKey});
const MODEL = "open-mistral-nemo";

export async function POST(request: Request) {  
  const data = await request.json();
  const messages = data.messages;
  if (!apiKey) {
    return Response.json({ response: "No API key provided." });
  }
  try {
    if (!messages.length || messages[messages.length - 1].content === "") {
      return Response.json({ response: "No input provided." });
  }

  const chatResponse = await client.chat.complete({
    model: MODEL,
    messages: messages,
  });

  console.log("Chat:", chatResponse);
  if (chatResponse.choices && chatResponse.choices.length > 0) {  
      return Response.json({ response: chatResponse.choices[0].message.content });
    } else {
      return Response.json({ response: "No response from the model." });
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error:", error);
    if (error.body) {
      return Response.json({ status: 500, response: error.body });
    } else {
      return Response.json({ status: 500, response: "An error occurred while processing your request." });
    }
  }

}
