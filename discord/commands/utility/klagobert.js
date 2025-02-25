const { SlashCommandBuilder, InteractionContextType } = require('discord.js');
const CleverbotApi = new require('../../cleverbot-api');
const cleverbot = new CleverbotApi();

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

		await cleverbot.send(msg, async function (response) {
			console.log(response.output)
			await interaction.reply(`***${msg}*** ${response.output}`);
		 });
	},
};