import fs from "fs";

export function backupFile(path: string) {
  const backupPath = `${path}.ahbackup`;
  fs.copyFileSync(path, backupPath);
  return backupPath;
}

export function restoreFile(path: string) {
  const backupPath = `${path}.ahbackup`;
  fs.copyFileSync(backupPath, path);
}

export function restortAllFiles(paths: string[]) {
  paths.forEach((path) => {
    restoreFile(path);
  });
}
