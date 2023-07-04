import { MySlashCommand } from '../types';
import {
  ApplicationCommandSubCommand,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Ver los comandos disponibles'),

  async run(interaction) {
    const embed = new EmbedBuilder().setColor('Random').setTitle('Comandos');
    const commands = interaction.guildId
      ? await interaction.guild?.commands.fetch()
      : await interaction.client.application.commands.fetch();

    if (!commands)
      return await interaction.reply({
        embeds: [embed],
      });

    const filteredCommands = commands.filter(command =>
      // !command.defaultMemberPermissions &&
      interaction.client.commands.get(command.name),
    );

    embed.setDescription(
      filteredCommands
        .map(command => {
          const subs = command.options.filter(
            opt => opt.type === 1,
          ) as unknown as Array<ApplicationCommandSubCommand>;

          return subs.length
            ? subs
                .map(
                  sub =>
                    `> </${command.name} ${sub.name}:${command.id}> ${
                      sub.options
                        ?.map(opt =>
                          opt.required ? `<${opt.name}>` : `[${opt.name}]`,
                        )
                        ?.join(' ') ?? ''
                    } -- ${sub.description}`,
                )
                .join('\n')
            : `> </${command.name}:${command.id}> ${command.options
                .map((opt: any) =>
                  opt.required ? `<${opt.name}>` : `[${opt.name}]`,
                )
                .join(' ')} -- ${command.description}`;
        })
        .join('\n'),
    );

    await interaction.reply({
      embeds: [embed],
    });
  },
} as MySlashCommand;
