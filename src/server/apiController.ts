import { Express, Request, Response } from 'express';
import { injectable } from 'inversify';
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import { Uri } from 'vscode';
import { CommittedFile, IGitService, IGitServiceFactory, LogEntries, LogEntry } from '../types';
import { IApiRouteHandler, IStateStore } from './types';

// tslint:disable-next-line:no-require-imports no-var-requires
const shorthash = require('shorthash');

@injectable()
export class ApiController implements IApiRouteHandler {
    constructor(private app: Express,
        private gitServiceFactory: IGitServiceFactory,
        private stateStore: IStateStore) {

        this.app.get('/log', this.getLogEntries);
        this.app.get('/branches', this.getBranches);
        this.app.get('/log/:hash', this.getCommit);
        this.app.post('/log/:hash', this.selectCommit);
        this.app.post('/log/:hash/committedFile', this.selectCommittedFile);
        this.app.post('/log/:hash/cherryPick', this.cherryPickCommit);
    }

    private workspaceFolders: Map<string, string> = new Map<string, string>();
    public registerWorkspaceFolder(workspaceFolder: string) {
        const id: string = shorthash.unique(workspaceFolder);
        this.workspaceFolders.set(id, workspaceFolder);
        return id;
    }
    private getWorkspace(id: string) {
        return this.workspaceFolders.get(id)!;
    }
    private getRepository(id: string): IGitService {
        const workspaceFolder = this.getWorkspace(id);
        return this.gitServiceFactory.createGitService(workspaceFolder);
    }
    public getLogEntries = (request: Request, response: Response) => {
        const id: string = request.query.id;
        const searchText = request.query.searchText;
        const pageIndex: number | undefined = request.query.pageIndex;
        const branch = request.query.branch;
        const pageSize: number | undefined = request.query.pageSize;
        const filePath: string | undefined = request.query.file;
        const file = filePath ? Uri.file(filePath) : undefined;

        let promise: Promise<LogEntries>;
        const workspaceFolder = this.getWorkspace(id);
        const currentState = this.stateStore.getState(workspaceFolder);

        if (currentState.searchText === searchText &&
            currentState.pageIndex === pageIndex &&
            currentState.branch === branch &&
            currentState.pageSize === pageSize &&
            currentState.file === file &&
            currentState.entries) {

            promise = currentState.entries;
        }
        else {
            promise = this.getRepository(request.query.id)
                .getLogEntries(pageIndex, pageSize, branch, searchText);
            this.stateStore.updateEntries(workspaceFolder, promise,
                pageIndex, pageSize, branch, searchText, file);
        }

        promise
            .then(data => response.send(data))
            .catch(err => response.status(500).send(err));
    }
    public getBranches = (request: Request, response: Response) => {
        const id: string = request.query.id;
        this.getRepository(id)
            .getBranches()
            .then(data => response.send(data))
            .catch(err => response.status(500).send(err));
    }
    public getCommit = (request: Request, response: Response) => {
        const id: string = request.query.id;
        const hash: string = request.params.hash;

        this.getRepository(id).getCommit(hash)
            .then(data => response.send(data))
            .catch(err => response.status(500).send(err));
    }
    public cherryPickCommit = (request: Request, response: Response) => {
        // const id: string = request.query.id;
        const hash: string = request.params.hash;
        // tslint:disable-next-line:no-console
        console.log(hash);
        response.send('');
        // this.repository.getCommit(request.params.hash)
        //     .then(data => response.send(data))
        //     .catch(err => response.status(500).send(err));
    }
    public selectCommit = (request: Request, response: Response) => {
        // const id: string = request.query.id;
        const hash: string = request.params.hash;
        // tslint:disable-next-line:no-console
        console.log(hash);

        // let promise: Promise<LogEntry | undefined>;
        // const workspaceFolder = this.getWorkspace(id);
        // const currentState = this.stateStore.getState(workspaceFolder);

        // // tslint:disable-next-line:possible-timing-attack
        // if (currentState.hash === hash &&
        //     currentState.commit) {

        //     promise = currentState.commit;
        // }
        // else {
        // promise = this.getRepository(id).getCommit(hash);
        // this.stateStore.updateSelection(workspaceFolder, hash, promise);
        // }

        // promise
        //     .then(data => response.send(data))
        //     .catch(err => response.status(500).send(err));

        response.send('');
    }
    public selectCommittedFile = (request: Request, response: Response) => {
        // tslint:disable-next-line:prefer-type-cast
        const committedFile = request.body as CommittedFile;
        // tslint:disable-next-line:no-console
        console.log(committedFile);
    }
}
