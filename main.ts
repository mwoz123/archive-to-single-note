import { App, ButtonComponent, Editor, MarkdownView, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';


interface PluginSettings {
	archiveFile: string;
	additionalArchives: [string];
}

const DEFAULT_SETTINGS: PluginSettings = {
	archiveFile: 'archive.md',
	additionalArchives: ['hobby/archive.md']
}

export default class ArchiveToSingleFilePlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		// const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
		// });

		this.addCommand({
			id: 'archive-to-default-file',
			name: 'Archive file',
			editorCallback: (editor: Editor, view: MarkdownView) =>
				archiveFile(editor, this.app, this.settings.archiveFile)
		});

		// this.addCommand({
		// 	id: 'archive-to-additional-file',
		// 	name: 'Archive to additional (e.g. hobby) file',
		// 	editorCallback: (editor: Editor, view: MarkdownView) =>
		// 		// archiveFile(editor, this.app, this.settings.archiveHobbyFile)
		// });

		this.addSettingTab(new ArchiveToSingleFilePluginSettingTab(this.app, this));
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

async function archiveFile(editor: Editor, app: App, filePath: string) {
	const activeFile = app.workspace.getActiveFile();
	if (!activeFile) {
		return;
	}
	const { basename } = activeFile;

	const toBeArchivedContents = `# ${basename} \n${editor.getValue()}`;
	if (! await app.vault.adapter.exists(filePath)) {
		app.vault.create(filePath, toBeArchivedContents);
	} else {
		const archiveTFile = app.vault.getAbstractFileByPath(filePath);
		app.vault.append(<TFile>archiveTFile, toBeArchivedContents)
	}
	app.vault.delete(activeFile);
}


class ArchiveToSingleFilePluginSettingTab extends PluginSettingTab {
	plugin: ArchiveToSingleFilePlugin;

	constructor(app: App, plugin: ArchiveToSingleFilePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Archive file path')
			.setDesc('with folder prefix (if required)')
			.addText(text => text
				.setPlaceholder('archive.md')
				.setValue(this.plugin.settings.archiveFile)
				.onChange(async (value) => {
					this.plugin.settings.archiveFile = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl).addButton((cb: ButtonComponent) => {
			cb.setButtonText("Add");
			cb.onClick(() => {
				this.plugin.settings.additionalArchives.push("archive-" + this.plugin.settings.additionalArchives.length + ".md")
				containerEl.empty();
				this.display();
			})
		});

		this.plugin.settings.additionalArchives.map((archiveName, index, array) => {
			console.log(array)
			new Setting(containerEl)
				.setName('Archive ' + archiveName)
				.setDesc('with folder prefix (if required)')
				.addText(text => text
					.setValue(archiveName)
					.onChange(async (value) => {
						this.plugin.settings.additionalArchives[index] = value;
						await this.plugin.saveSettings();
					}))
			new Setting(containerEl).addButton((cb: ButtonComponent) => {
				cb.setButtonText("Remove");
				cb.onClick(() => {
					array.splice(index, 1)
					containerEl.empty();
					this.display();
				})
			}
			);

		})
	}
}