import Discord, { ClientEvents } from 'discord.js';
import Bot from './structures/Bot';

// export interface CommandEvent {
//   name: string;

//   /**
//    * La funcion principal del evento
//    */
//   run(interaction: Discord.Interaction & { client: Bot }): void | Promise<void>;
// }

export interface MyBotEvents<E extends keyof ClientEvents> {
  name: E;

  /**
   * La funcion principal del evento
   */
  run(
    ...args: [ClientEvents[E][number] & { client: Bot }] // FIXME solo funciona si tiene un solo argumento, con el evento roleUpdate no funciona
  ): //
  //   [K in keyof ClientEvents[E]]: { client: Bot } & Omit<
  //     ClientEvents[E][K],
  //     'client'
  //   >;
  // }
  // ...args: {
  // [K in keyof ClientEvents[E]]: ClientEvents[E][K] & { client: Bot };
  // }
  void | Promise<void>;
  // ^?
}

type arreglo = Array<1 | 2>[0];

export interface MyReadyEvent {
  name: 'ready';

  run(client: Bot): void | Promise<void>;
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

export type SlashCommandsCollection = Discord.Collection<
  string,
  MySlashCommand
>;

export type RateLimits = Discord.Collection<string, Date>;
