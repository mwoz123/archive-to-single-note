import { App, Editor, FileSystemAdapter, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian';


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
			name: 'Archive to default file',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const file = view.file;
				// const {basename, path} = file;

				// const toBeArchivedContents = `# ${basename} \n${editor.getValue()}`;
				const toBeArchivedContents = editor.getValue();
				console.log(toBeArchivedContents);
				// const vaultRoot = this.app.vault.getRoot()
				
				// const archivePath = normalizePath(vaultRoot + this.settings.archiveFile);
				// const archivePath2 = normalizePath(this.settings.archiveFile);
				this.app.vault.adapter.append(this.settings.archiveFile, toBeArchivedContents);
				// this.app.vault.adapter.remove(file?.path);

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
			.setName('Archive path')
			.setDesc('with folder (if any)')
			.addText(text => text
				.setPlaceholder('Enter your path')
				.setValue(this.plugin.settings.archiveFile)
				.onChange(async (value) => {
					this.plugin.settings.archiveFile = value;
					await this.plugin.saveSettings();
				}));
	}
}
