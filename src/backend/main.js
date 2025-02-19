import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import serve from 'electron-serve';
import chokidar from 'chokidar';
import { fileURLToPath } from 'url';
import { ChromaClient } from 'chromadb';
import { fork, spawn, spawnSync } from 'child_process';
import OpenAI from 'openai';
import _ from "lodash";

const port = process.env.PORT || 5173;
const dev = !app.isPackaged;
const loadURL = serve({ directory: './build' });
let mainWindow;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @type {import('openai').OpenAI}
 */
let openAi = null;

let config = {
  openaiKey: ""
}

const createWindow = async () => {
  const chroma = new ChromaClient({
    path: "http://localhost:8000"
  });

  if (!await checkIfChromaIsAlive(chroma)) {
    try {
      spawnSync("docker", ["run", "-d", "--rm", "--name", "chromadb", "-p", "8000:8000", "-v", "./chroma:/chroma/chroma", "-e", "IS_PERSISTENT=TRUE", "-e", "ANONYMIZED_TELEMETRY=TRUE", "chromadb/chroma:0.5.20"], {
        cwd: app.getPath('userData')
      });
    } catch {}
  }

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 800,
    title: 'AI Translator by Erdem',
    transparent: true,
    frame: false,
    resizable: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (dev) {
    mainWindow.loadURL(`http://localhost:${port}`);
  } else {
    mainWindow.loadURL('app://-/');
  }

  ipcMain.on('minimize', () => mainWindow.minimize());
  ipcMain.on('maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.on('close', () => mainWindow.close());

  ipcMain.on('getChromaData', async (event, responseId, databaseName) => {
    const collection = await chroma.getOrCreateCollection({
      name: databaseName || 'default'
    });
    const keywords = await collection.get().then((r) => r.metadatas);
    event.reply(responseId, keywords)
  });

  ipcMain.on('addChromaData', async (event, responseId, databaseName, dataFrom, dataTo) => {
    try {
      const data = {
        from: dataFrom,
        to: dataTo
      }
  
      const collection = await chroma.getOrCreateCollection({
        name: databaseName || 'default'
      });

      const chatGptResponse = 
        await tryEmbeddings(data.from);
  
      await collection.add({
        embeddings: chatGptResponse.data.map(d => d.embedding),
        ids: [data.from],
        documents: [data.from],
        metadatas: [data]
      });
      console.log("added", data)
      event.reply(responseId, true);
      ipcMain.emit('chromaDataAdded', databaseName, data.from, data.to);
    } catch (e) {
      console.log(e)
      event.reply(responseId, false);
    }
  });

  ipcMain.on('deleteChromaData', async (event, databaseName, dataFrom) => {
    try {
      const collection = await chroma.getOrCreateCollection({
        name: databaseName || 'default'
      });
  
      await collection.delete({
        ids: [dataFrom]
      });
  
      ipcMain.emit('chromaDataDeleted', databaseName, dataFrom);
    } catch (e) {
      console.log(e)
    }
  })

  ipcMain.on('findKeywords', async (event, responseId, query) => {
    try {
      console.log("query")
      const keywords = await findKeywordsFromText(query);
      console.log("keywords")
      event.reply(responseId, keywords);
    } catch {
      event.reply(responseId, []);
    }
  });

  ipcMain.on('translate', async (event, responseId, databaseName, sourceLang, targetLang, text, previousLines) => {
    try {
      console.log("translating:", text)
      let translatedString = await translate(databaseName, text, previousLines, chroma, sourceLang, targetLang);
      console.log("translated:", translatedString)
      event.reply(responseId, translatedString);
    } catch (e) {
      console.log("error", e)
      event.reply(responseId, false);
    }
  });

  ipcMain.on('setOpenAIKey', _.debounce((event, key) => {
    process.env.OPENAI_KEY = key;
    config.openaiKey = key;
    openAi = new OpenAI({
      apiKey: key
    });
    console.log("setOpenAIKey", key)
  }, 1000));

};

/**
 * 
 * @param {String} databaseName 
 * @param {String} text 
 * @param {String} previousLines
 * @param {String} fromLang
 * @param {String} toLang
 * @param {import("chromadb").ChromaClient} chroma
 */
async function translate(databaseName, text, previousLines, chroma, fromLang, toLang, tried = 0) {

  const collection = await chroma.getOrCreateCollection({
    name: databaseName || 'default'
  });

  const keywordFindEmbedding = await tryEmbeddings(text);

  /**
   * @type {Array<{ from: String, to: String}>}
   */
  const results = await collection.query({
    queryEmbeddings: keywordFindEmbedding.data.map(d => d.embedding),
    nResults: 5
  }).then(r => r.metadatas[0]);
  
  const tranlsation = await openAi.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You should translate the text provided by user. Source language is ${fromLang}, Output language is ${toLang}. Make sure to translate theese words properly. And use the following keyword translations to translate the text.\nKeyword translations: ` + results.map(r => `"${r.from}" > "${r.to}"\nPrevious Translated Lines:\n${previousLines}\nSometimes previous lines are connected to the current translation, or opposite sometimes current translation is not the end of the translation keep in mind that.`).join(", ")
      },
      {
        role: "user",
        content: text
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "translation",
        schema: {
          type: "object",
          properties: {
            translation: {
              type: "string"
            }
          }
        }
      }
    }
  });

  try {
    /** @type {String} */
    const result = JSON.parse(tranlsation.choices[0].message.content).translation;
    if (typeof result !== "string") throw new Error("Invalid response");
    return result;
  } catch {
    if (tried < 3) {
      console.log("retrying", tried);
      return translate(databaseName, text, chroma, fromLang, toLang, tried + 1);
    } else {
      throw new Error("Invalid response");
    }
  }

}

async function findKeywordsFromText(text, tried) {
  try {
    if (!tried) tried = 0;
    console.log("findKeywords")
    const response = await openAi.chat.completions.create({
      model: "gpt-4o-mini",
      stream: false,
      messages: [
        {
          role: "system",
          content: "You should find the keywords of the text provided by user. This is a translation file, also you can select language specific words like 'chan' in japanese etc. Make sure to select every keyword properly. Theese keywords will be translated and will be used on translation of the complete text."
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "keyword_findings",
          schema: {
            type: "object",
            properties: {
              keywords: {
                type: "array",
                items: {
                  type: "string"
                }
              }
            }
          }
        }
      }
    });
    console.log("response")


    try {
      const result = JSON.parse(response.choices[0].message.content)?.keywords;
      if (Array.isArray(result) && (!result.length || typeof result[0] === "string")) {
        return result;
      } else {
        throw new Error("Invalid response");
      }
    } catch {
      if (tried < 3) {
        return findKeywordsFromText(text, tried + 1);
      } else {
        throw new Error("Invalid response");
      }
    }
  } catch (e) {
    console.log(e)
    return [];
  }
}

/**
 * @param {ChromaClient} chroma 
 * @returns 
 */
async function checkIfChromaIsAlive(chroma) {
  let hb = await chroma.heartbeat().catch(() => null);
  return hb != null
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

if (dev) {
  const watcher = chokidar.watch(['./src/backend', './main.js'], {
    ignored: /node_modules/,
    persistent: true,
  });

  watcher.on('change', () => {
    app.relaunch();
    app.exit();
  });
}

async function tryEmbeddings(content, tried = 0) {
  try {
    return await openAi.embeddings.create({
      input: content,
      model: "text-embedding-3-large",
    });
  } catch (e) {
    if (tried < 3) {
      await new Promise(r => setTimeout(r, 3000 * tried));
      return await tryEmbeddings(content, tried + 1);
    } else {
      throw e;
    }
  }
}