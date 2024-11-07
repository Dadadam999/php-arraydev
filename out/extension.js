"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.addPhpProperty', () => __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const propertyName = yield vscode.window.showInputBox({ prompt: 'Enter property name' });
        if (!propertyName) {
            return;
        }
        const propertyType = yield vscode.window.showInputBox({ prompt: 'Enter property type' });
        if (!propertyType) {
            return;
        }
        const document = editor.document;
        const text = document.getText();
        const classMatch = text.match(/class\s+\w+\s*{/);
        if (classMatch && classMatch.index !== undefined) {
            const classStartPos = classMatch.index + classMatch[0].length;
            const classEndMatch = text.match(/}\s*$/);
            const classEndPos = (classEndMatch ? classEndMatch.index : text.length);
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
            yield vscode.workspace.applyEdit(edit);
            yield editor.document.save();
        }
    }));
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}
function deactivate() { }
exports.deactivate = deactivate;
