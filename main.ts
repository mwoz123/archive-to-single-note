import { App, Editor, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian';


interface PluginSettings {
	archiveFile: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
	archiveFile: 'archive.md'
}

export default class SingleFileArchiverPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'archive-to-default-file',
			name: 'Archive file',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const activeFile = this.app.workspace.getActiveFile();
				if (!activeFile) {
					return;
				}
				const {basename} = activeFile;

				const toBeArchivedContents = `# ${basename} \n${editor.getValue()}`;
				this.app.vault.adapter.append(this.settings.archiveFile, toBeArchivedContents);
				this.app.vault.delete(activeFile);

			}
		});

		this.addSettingTab(new SingleFileArchiverPluginSettingTab(this.app, this));
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


class SingleFileArchiverPluginSettingTab extends PluginSettingTab {
	plugin: SingleFileArchiverPlugin;

	constructor(app: App, plugin: SingleFileArchiverPlugin) {
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
