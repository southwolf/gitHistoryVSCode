import { LogEntry, FileStat, Modification } from '../contracts';
import { AddedIcon, FileStatNode, ModifiedIcon, RemovedIcon } from '../commitViewer/logEntryNode';

export class CompareFileStatNode extends FileStatNode {
    constructor(public fileStat: FileStat, leftLogEntry: LogEntry, public rightLogEntry: LogEntry) {
        super(fileStat, leftLogEntry);
        switch (fileStat.mode) {
            case Modification.Modified: {
                this.contextValue = 'fileStatM';
                this.iconPath = ModifiedIcon;
                this.command = {
                    title: 'Compare against previous version',
                    command: 'git.commit.FileEntry.CompareAgainstCommit',
                    arguments: [this]
                };
                break;
            }
            case Modification.Created: {
                this.contextValue = 'fileStatA';
                this.iconPath = AddedIcon;
                this.command = {
                    title: 'View File Contents',
                    command: 'git.commit.FileEntry.ViewFileContents',
                    arguments: [new FileStatNode(fileStat, rightLogEntry)]
                };
                break;
            }
            case Modification.Deleted: {
                this.contextValue = 'fileStatD';
                this.iconPath = RemovedIcon;
                this.command = {
                    title: 'View File Contents',
                    command: 'git.commit.FileEntry.ViewFileContents',
                    arguments: [new FileStatNode(fileStat, leftLogEntry)]
                };
                break;
            }
        }
    }
}