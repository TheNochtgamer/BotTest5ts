import { MySlashCommand } from '../types';
import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Recarga los archivos')
    .setDefaultMemberPermissions(8),
  onlyOwners: true,

  async run(interaction) {
    const confirm = await interaction.client.utils.confirmationCheck(
      interaction,
      '¿Estas seguro de recargar los comandos y eventos?',
    );

    if (!confirm) {
      interaction.deleteReply();
      return;
    }

    console.log(`${interaction.user.username} esta recargando los archivos...`);
    await interaction.editReply({
      content: `Recargando archivos, porfavor espera...`,
    });

    await Promise.allSettled([
      interaction.client.loadEvents(),
      interaction.client.loadCommands(),
    ]);
    await interaction.client.utils.summitCommands();

    await interaction.editReply({
      content: `Recarga de archivos terminada.`,
    });
  },
} as MySlashCommand;
