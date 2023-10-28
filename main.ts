import { App, Editor, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian';


interface PluginSettings {
	archiveFile: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
	archiveFile: 'archive.md'
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
				archiveFile(editor, this.app, this.settings)
			
		});

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

function archiveFile( editor: Editor, app: App , settings: PluginSettings) {
	const activeFile = app.workspace.getActiveFile();
	if (!activeFile) {
		return;
	}
	const {basename} = activeFile;

	const toBeArchivedContents = `# ${basename} \n${editor.getValue()}`;
	app.vault.adapter.append(settings.archiveFile, toBeArchivedContents);
	app.vault.delete(activeFile);
}


class ArchiveToSingleFilePluginSettingTab extends PluginSettingTab {
	plugin: ArchiveToSingleFilePlugin;

	constructor(app: App, plugin: ArchiveToSingleFilePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Archive file path')
			.setDesc('with folder (if required)')
			.addText(text => text
				.setPlaceholder('archive.md')
				.setValue(this.plugin.settings.archiveFile)
				.onChange(async (value) => {
					this.plugin.settings.archiveFile = value;
					await this.plugin.saveSettings();
				}));
	}
}
