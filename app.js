import { REST, Routes, Client, GatewayIntentBits } from 'discord.js';
import CharacterAI from "node_characterai";
const characterAI = new CharacterAI();

const TOKEN = "";
const CLIENT_ID = "";
const CHARACTER_AI_TOKEN = "";
const CHARACTER_ID = "";

const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
  {
    name: 'hi',
    description: 'Basic command',
  }
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

// Function to register commands
async function registerCommands() {
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error while refreshing application (/) commands:', error);
  }
}

// Register commands
registerCommands();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  try {
    // Authenticate once when the bot starts
    await characterAI.authenticateWithToken(CHARACTER_AI_TOKEN);
    console.log('Character AI authenticated successfully.');
  } catch (error) {
    console.error('Error during Character AI authentication:', error);
  }
});

client.on('interactionCreate', async interaction => {



  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    console.log("pong!");
    await interaction.reply('Pong!');
  }

  if (interaction.commandName === 'hi') {
    console.log("hi!");
    await interaction.reply('Hello!');
  }
});

client.on('messageCreate', async (message) => {

  // const username = message.author.username;
  // console.log('Username yang mengirim pesan: ' + username);
  const displayName = message.member.displayName;

  // Pastikan bot tidak merespons pesan dari dirinya sendiri
  if (message.author.bot) return;

  if (message.content.startsWith('.')) {
    try {
      // Create a chat object to interact with the conversation
      const chat = await characterAI.createOrContinueChat(CHARACTER_ID);
      
      // Send a message
      const response = await chat.sendAndAwaitResponse(`${message.content} ~ @${displayName}`, true);
      
      // Send the response text as a reply
      if (response && response.text) {
        await message.reply(response.text);
      } else {
        console.error("No response text available.");
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
});

client.login(TOKEN);
