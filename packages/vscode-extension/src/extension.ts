import * as vscode from "vscode";
import { transpile, translateError } from "@c-script/core";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

export function activate(context: vscode.ExtensionContext) {
  const transpileCommand = vscode.commands.registerCommand(
    "c-script.transpile",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("Нема отвореног фајла.");
        return;
      }

      const source = editor.document.getText();

      try {
        const js = transpile(source);
        const doc = await vscode.workspace.openTextDocument({
          content: js,
          language: "javascript",
        });
        await vscode.window.showTextDocument(doc, { preview: false });
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? translateError(err.message)
            : String(err);
        vscode.window.showErrorMessage(`Грешка при превођењу: ${message}`);
      }
    }
  );

  const runCommand = vscode.commands.registerCommand(
    "c-script.run",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("Нема отвореног фајла.");
        return;
      }

      const source = editor.document.getText();

      try {
        const js = transpile(source);
        const tmpFile = path.join(os.tmpdir(), `c-script-${Date.now()}.js`);
        fs.writeFileSync(tmpFile, js, "utf-8");

        const terminal =
          vscode.window.activeTerminal ??
          vscode.window.createTerminal("ћ-скрипт");
        terminal.show();
        terminal.sendText(`node "${tmpFile}"`);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? translateError(err.message)
            : String(err);
        vscode.window.showErrorMessage(`Грешка при превођењу: ${message}`);
      }
    }
  );

  context.subscriptions.push(transpileCommand, runCommand);
}

export function deactivate() {}
