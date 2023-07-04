import path from 'path';
import fs from 'fs';
import Bot from './Bot';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  Collection,
  ColorResolvable,
  CommandInteraction,
  EmbedBuilder,
  EmbedData,
  ModalSubmitInteraction,
} from 'discord.js';

export default class Utils {
  client: Bot;
  rateLimits = new Collection<string, { lastTick: Date; uses: number }>();

  constructor(client: Bot) {
    this.client = client;
  }

  async loadFiles(dirName = '') {
    const PATH = path.join(process.cwd(), './src', dirName);
    const FILES = fs
      .readdirSync(PATH)
      .filter(f => f.endsWith('.ts'))
      .map(f => path.join(PATH, f));

    return FILES;
  }

  /**
   * Chequea que un snowflake de discord sea valido
   * @param {String} id
   * @returns {Boolean}
   */
  checkId(id: string = ''): boolean {
    return !isNaN(parseInt(id)) && id?.length >= 17 && id?.length <= 20;
  }

  async summitCommands(guildId = process.env.GUILD) {
    if (!this.client.commands.size) return;
    let cmds = null;

    console.log('Subiendo comandos...');
    try {
      if (guildId) {
        const GUILD = await this.client.guilds.fetch(guildId);
        if (!this.client.utils.checkId(guildId) || !GUILD)
          throw new Error('Id invalida');
        cmds = await GUILD.commands.set(
          this.client.commands.map(cmd => cmd.data),
        );
      } else {
        cmds = await this.client.application?.commands?.set(
          this.client.commands.map(cmd => cmd.data),
        );
      }
      if (!cmds) throw new Error('No se subio ningun comando');
      console.log(`(/) ${cmds.size} comandos subidos`);
    } catch (error) {
      console.log('Error al intentar subir los comandos', error);
    }
  }

  /**
   * Responde una interaccion con un embed sin necesidad de preocuparte de que rejecte
   */
  async embedReply(
    interaction: CommandInteraction,
    embedData: Omit<EmbedData, 'color'> & { color: ColorResolvable | number },
  ) {
    const embed = new EmbedBuilder(embedData as unknown as EmbedData);
    let reply;

    if (typeof embedData.color === 'undefined') {
      embed.setColor('White');
    } else {
      embed.setColor(embedData.color);
    }
    if (typeof embedData.timestamp === 'undefined') embed.setTimestamp();
    if (typeof embedData.footer === 'undefined')
      embed.setFooter({ text: interaction.client.user.username });

    try {
      if (interaction.replied || interaction.deferred) {
        reply = await interaction.editReply({ embeds: [embed] });
      } else {
        reply = await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    } catch (error) {
      console.log(`Error al responder una interaccion`, error);
      return null;
    }
    return reply;
  }

  /**
   * Revisa que exista un rateLimit en vigencia con el identificador
   *
   * en caso de estar vigente, devuelve 0
   *
   * en caso de no estar vigente, devuelve 1 y crea un nuevo rateLimit
   */
  async rateLimitCheck(
    identifier: string = '',
    cooldown?: number,
    uses: number = 1,
  ) {
    if (!cooldown || cooldown < 500) return 1;
    const now = new Date();
    const rateLimit = this.rateLimits.get(identifier);

    if (
      rateLimit &&
      (now.getTime() - rateLimit.lastTick.getTime() < cooldown ||
        rateLimit.uses++ < uses)
    )
      return 0;

    this.rateLimits.set(identifier, {
      lastTick: now,
      uses: uses,
    });
    return 1;
  }

  /**
   * Envia una simple confirmacion
   *
   * devuelve 1 si fue aceptada
   *
   * devuelve 0 si fue rechazada o se quedo sin tiempo
   */
  async confirmationCheck(
    interaction:
      | CommandInteraction
      | ButtonInteraction
      | ModalSubmitInteraction
      | ChatInputCommandInteraction,
    message: string,
  ) {
    const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
      new ButtonBuilder()
        .setCustomId('accept')
        .setStyle(ButtonStyle.Success)
        .setLabel('✅'),
      new ButtonBuilder()
        .setCustomId('deny')
        .setStyle(ButtonStyle.Danger)
        .setLabel('❌'),
    );

    const reply =
      interaction.replied || interaction.deferred
        ? await interaction.editReply({
            content: message,
            components: [row],
          })
        : await interaction.reply({
            content: message,
            components: [row],
            ephemeral: true,
          });

    const response = await reply.awaitMessageComponent({ idle: 30 * 1000 });

    await interaction.editReply({ components: [] });
    if (response.customId === 'accept') return 1;
    return 0;
  }
}

