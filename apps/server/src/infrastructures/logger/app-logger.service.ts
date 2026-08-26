import { ConsoleLogger, Injectable, Scope } from "@nestjs/common";

/**
 * AppLogger extends NestJS's built-in ConsoleLogger.
 * It is transient-scoped, so each class injecting it gets its own instance,
 * allowing you to set class-specific context.
 *
 * If you ever need to swap this with structured loggers like Pino or Winston,
 * you only need to modify this file to delegate calls (log, error, warn, etc.)
 * to the new library.
 */
@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger extends ConsoleLogger {}
