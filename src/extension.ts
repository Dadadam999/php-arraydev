import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.addPhpProperty', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const propertyName = await vscode.window.showInputBox({ prompt: 'Enter property name' });
        if (!propertyName) {
            return;
        }

        const propertyType = await vscode.window.showInputBox({ prompt: 'Enter property type' });
        if (!propertyType) {
            return;
        }

        const document = editor.document;
        const text = document.getText();
        const classMatch = text.match(/class\s+\w+\s*{/);

        if (classMatch && classMatch.index !== undefined) {
            const classStartPos = classMatch.index + classMatch[0].length;
            const classEndMatch = text.match(/}\s*$/);
            const classEndPos = (classEndMatch ? classEndMatch.index : text.length) as number;

            const propertySnippet = new vscode.SnippetString();
            propertySnippet.appendText(`\nprivate ${propertyType} $${propertyName};\n`);
            propertySnippet.appendText(`\npublic function get${capitalize(propertyName)}(): ${propertyType} {\n`);
            propertySnippet.appendText(`    return \$this->${propertyName};\n`);
            propertySnippet.appendText(`}\n`);
            propertySnippet.appendText(`\npublic function set${capitalize(propertyName)}(${propertyType} $${propertyName}): void {\n`);
            propertySnippet.appendText(`    \$this->${propertyName} = \$${propertyName};\n`);
            propertySnippet.appendText(`}\n`);

            const edit = new vscode.WorkspaceEdit();
            const classEndPosition = document.positionAt(classEndPos);
            edit.insert(document.uri, classEndPosition, propertySnippet.value);

            await vscode.workspace.applyEdit(edit);
            await editor.document.save();
        }
    });

    context.subscriptions.push(disposable);
}

function capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

export function deactivate() {}
