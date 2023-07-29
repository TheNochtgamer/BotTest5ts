import Discord, { ClientEvents } from 'discord.js';
import Bot from './structures/Bot';

export interface MyReadyEvent {
  name: 'ready';

  run(client: Bot): void | Promise<void>;
}

export interface MyBotEvents<E extends keyof ClientEvents> {
  name: E;

  /**
   * La funcion principal del evento
   */
  run(
    ...args: [ClientEvents[E][number] & { client: Bot }]
  ): void | Promise<void>;
}

export interface MyBotEvents2Args<E extends keyof ClientEvents> {
  name: E;

  /**
   * La funcion principal del evento
   */
  run(
    ...args: [
      ClientEvents[E][0] & { client: Bot },
      ClientEvents[E][1] & { client: Bot },
    ]
  ): void | Promise<void>;
}

export interface MySlashCommand {
  /**
   * Lista de ids de roles requeridos para utilizar el comando
   */
  roles_req?: string[];

  /**
   * Lista de permisos requeridos para utilizar el comando
   */
  perms_req?: Discord.PermissionResolvable[];

  /**
   * Si es requerido que el usuario tenga todos los roles para utilizar el comando
   */
  allRoles_req?: boolean;

  /**
   * Si es requerido que el usuario tenga todos los permisos para utilizar el comando
   */
  allPerms_req?: boolean;

  /**
   * Si es requerido que el usuario tenga los roles y los permisos requeridos para utilizar el comando
   */
  everthing_req?: boolean;

  /**
   * Convierte el comando unicamente disponible para los owners declarados en el .env
   */
  onlyOwners?: boolean;

  /**
   * Tiempo en ms de enfriamiento del comando por persona
   */
  rateLimit?: number;

  /**
   * Los datos del comando a cargar a discord
   */
  data: Discord.SlashCommandBuilder;

  /**
   * La funcion principal del comando
   */
  run(
    interaction: Discord.CommandInteraction & { client: Bot },
  ): void | Promise<void>;
}

