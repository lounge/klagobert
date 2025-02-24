const { SlashCommandBuilder, InteractionContextType } = require('discord.js');
const Cleverbot = require('cleverbot-node');
const { cleverbotKey } = require('../../config.json');

const cleverbot = new Cleverbot();
cleverbot.configure({botapi: cleverbotKey});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('klagobert_msg')
		.setDescription('fifi!')
		.addStringOption(option =>
			option.setName('message')
				.setRequired(true)
				.setDescription('va?'))
		.setContexts(InteractionContextType.Guild),
	async execute(interaction) {
		const msg = interaction.options.getString('message');

		cleverbot.write(msg, async function (response) {
			console.log(response.output)
			await interaction.reply(`***${msg}*** ${response.output}`);

		 });
	},
};