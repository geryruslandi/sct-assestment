import * as shell from 'shelljs';

export const silentExec = (command: string) => {
  return shell.exec(command, { silent: true });
};
