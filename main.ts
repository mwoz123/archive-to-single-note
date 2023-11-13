import { App, ButtonComponent, Editor, MarkdownView, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';


interface PluginSettings {
	archives: string[];
}

const DEFAULT_SETTINGS: PluginSettings = {
	archives: ['archive-main.md', 'hobby/archive.md']
}

export default class ArchiveToSingleFilePlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		// const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
		// });

		addArchivesToCommandPallete(this);

		this.addSettingTab(new ArchiveToSingleFilePluginSettingTab(this.app, this));
		return this;
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

	const toBeArchivedContents = `\n# ${basename} \n${editor.getValue()}`;
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

		this.plugin.settings.archives.map((archiveName: string, index, array) => {
			new Setting(containerEl)
				.setName('Archive ' + (index + 1) + " path")
				.setDesc('with folder prefix (if needed)')
				.addText(text => text
					.setValue(archiveName)
					.onChange(async (value) => {
						this.plugin.settings.archives[index] = value;
						await this.plugin.saveSettings();
					})).addButton((cb: ButtonComponent) => {
						cb.setButtonText("Remove");
						cb.onClick(() => {
							array.splice(index, 1)
							containerEl.empty();
							this.display();
						})
					}
					);
		})

		new Setting(containerEl).addButton((cb: ButtonComponent) => {
			cb.setButtonText("Add addional archives");
			cb.onClick(() => {
				this.plugin.settings.archives.push("archive-" + this.plugin.settings.archives.length + ".md")
				containerEl.empty();
				this.display();
			})
		});

		containerEl.createEl("h6", { text: "Restart application to update archives in Command Pallete or you can use button bellow"});
		new Setting(containerEl).addButton((cb: ButtonComponent) => {
			cb.setButtonText("Refresh archives in command pallete");
			cb.onClick(() => {
				// addArchivesToCommandPallete(this.plugin);
				this.plugin.unload();
				const newPlugin = this.plugin.load();
				this.display();
			})
		});
	}

}
function addArchivesToCommandPallete(plugin: ArchiveToSingleFilePlugin) {
	plugin.settings.archives.forEach(archiveName => plugin.addCommand({
		id: archiveName.replace(" ", '-'),
		name: 'Archive to ' + archiveName,
		editorCallback: (editor: Editor, view: MarkdownView) => archiveFile(editor, plugin.app, archiveName)
	}));
}

