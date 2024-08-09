import "cheerio";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { AzureOpenAIEmbeddings } from "@langchain/azure-openai"
import { AzureChatOpenAI } from "@langchain/azure-openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";

const llm = new AzureChatOpenAI({
  azureOpenAIApiDeploymentName: "gpt-4o_2024-05-13",
  azureOpenAIApiKey: "",
  azureOpenAIApiVersion: "0125",
  temperature: 0,
  azureOpenAIEndpoint: ""
  });
const question = "What is the capital of Virginia?"

export async function processQuestion(question: string): Promise<any> {
const pTagSelector = "p";
const firstLoader = new CheerioWebBaseLoader(
  "https://www.britannica.com/topic/list-of-state-capitals-in-the-United-States-2119210",
  { selector: pTagSelector }
  );
const firstdoc = await firstLoader.load();
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200
  });
const totalSplits = await textSplitter.splitDocuments(firstdoc);
const vectorStore = await MemoryVectorStore.fromDocuments(totalSplits)
new AzureOpenAIEmbeddings({
  azureOpenAIApiDeploymentName: "text-embedding-ada-002_2",
  azureOpenAIApiKey: api_Key,
  azureOpenAIApiVersion: "2",
  azureOpenAIEndpoint: ""
  })
  );
const retriever = vectorStore.asRetriever({ k: 6, searchType: "similarity" });
const template = `SYSTEM
  You will be provided with a document and a set of questions. Only answer questions relevant
  to the document.
  {context}
  Question: {question}
  Helpful Answer:`;
const customRagPrompt = PromptTemplate.fromTemplate(template);
const ragChain = await createStuffDocumentsChain({

  llm,
  prompt: customRagPrompt,
  outputParser: new StringOutputParser(),
});
let context = await retriever.getRelevantDocuments(question);
const answer = await ragChain.invoke({
  question: question,
  context
});
}

const x = processQuestion(question)
console.log(x)
