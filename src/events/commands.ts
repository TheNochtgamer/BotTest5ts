import { GuildMemberRoleManager, PermissionsBitField } from 'discord.js';
import { MyBotEvents } from '../types';

export default {
  name: 'interactionCreate',

  async run(interaction) {
    if (!interaction.isCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.log(`No se encontro el comando ${interaction.commandName}`);
      if (interaction.replied) return;
      try {
        interaction.reply({
          content:
            'Hubo un error interno al intentar encontrar el comando\nPorfavor intenta mas tarde...',
          ephemeral: true,
        });
      } catch (error) {}

      return;
    }

    // --NCheckAuth--
    /**
     * Parametros:
     * roles_req = String[]
     * perms_req = String[]
     * allRoles_req = Boolean
     * allPerms_req = Boolean
     * everthing_req = Boolean
     * onlyOwners = Boolean
     */
    /** Funcion para verificar que el usuario tenga los permisos de utilizar el comando */
    const authPass = async () => {
      if (process.env.BOT_OWNERS?.includes(interaction.user.id)) return 1;
      if (command.onlyOwners) return 0;
      if (!interaction.guildId) return 1;

      const member =
        interaction.member ??
        (await interaction.guild?.members.fetch(interaction.user.id));

      let rolesCheck = false;
      let permsCheck = false;

      // ROLES CHECK
      if (
        command.roles_req?.length &&
        member?.roles instanceof GuildMemberRoleManager
      ) {
        rolesCheck =
          (!!command.allRoles_req
            ? member?.roles.cache.hasAll(...command.roles_req)
            : member?.roles.cache.hasAny(...command.roles_req)) || false;
      } else rolesCheck = true;

      // PERMS CHECK
      if (
        command.perms_req?.length &&
        member?.permissions instanceof PermissionsBitField
      ) {
        const hasPerms = member?.permissions.toArray();
        permsCheck = !!command.allPerms_req
          ? hasPerms.every(hasPerm =>
              command.perms_req?.some(neededPerm => neededPerm === hasPerm),
            )
          : hasPerms.some(hasPerm =>
              command.perms_req?.some(neededPerm => neededPerm === hasPerm),
            );
      } else permsCheck = true;

      if (command.everthing_req) {
        if (rolesCheck && permsCheck) return 1;
      } else {
        if (rolesCheck || permsCheck) return 1;
      }

      return 0;
    };

    if (!(await authPass())) {
      console.log(
        `${interaction.user.username} intento acceder al comando "${interaction.commandName}" sin autorizacion`,
      );
      interaction.client.utils.embedReply(interaction, {
        color: 'Red',
        author: { name: '⛔Prohibido' },
        description:
          '```\n \n' +
          `> ${interaction.user.username}\n` +
          'No tienes permisos para usar este comando.\n \n```',
      });
      return;
    }
    // --NCheckAuth--

    // --RateLimiter--
    const identifier = `${interaction.commandName}-${interaction.user.id}`;
    if (
      !process.env.BOT_OWNERS?.includes(interaction.user.id) &&
      !interaction.client.utils.rateLimitCheck(identifier, command.rateLimit, 1)
    ) {
      console.log(
        `${interaction.user.username} supero el limite del comando "${interaction.commandName}"`,
      );
      interaction.client.utils.embedReply(interaction, {
        color: 'Yellow',
        author: { name: '🖐️Espera' },
        description:
          '```\n \n' +
          `> ${interaction.user.username}\n` +
          'Superaste el limite de ejecuciones, prueba de nuevo mas tarde.\n \n```',
      });
      return;
    }
    // --RateLimiter--

    console.log(
      `${interaction.user.username} ejecuto el comando "${interaction.commandName}"`,
    );

    try {
      await command.run(interaction);
    } catch (error) {
      console.log(
        `Hubo un error ejecutando el comando ${interaction.commandName}:`,
        error,
      );
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.editReply({
            content: 'Hubo un error interno al ejecutar el comando.',
          });
        } else {
          await interaction.reply({
            content: 'Hubo un error interno al ejecutar el comando.',
            ephemeral: true,
          });
        }
      } catch (error) {}
    }
  },
} as MyBotEvents<'interactionCreate'>;
