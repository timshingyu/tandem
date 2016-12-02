import "./index.scss";

import * as React from "react";
import * as cx from "classnames";
import * as electron from "electron";
import { FileInputComponent } from "@tandem/uikit";
import { TandemStudioBrowserStore } from "tandem-studio/browser/stores";
import { BaseApplicationComponent, inject } from "@tandem/common";
import { TandemStudioBrowserStoreProvider } from "tandem-studio/browser/providers";
import { 
  IStarterOption, 
  StartProjectRequest, 
  OpenWorkspaceRequest, 
  SelectDirectoryRequest,
  OpenGettingStartedProjectRequest, 
} from "tandem-studio/common";

// TODO - scan application directory for VSCode, and display "install extension" button if not already installed
export class WelcomeComponent extends BaseApplicationComponent<any, { selectedStarterOption: IStarterOption, cwd?: string }> {

  state = {
    selectedStarterOption: undefined,
    cwd: process.cwd()
  };

  @inject(TandemStudioBrowserStoreProvider.ID)
  private _store: TandemStudioBrowserStore;

  getStarted = () => {
    this.bus.dispatch(new OpenGettingStartedProjectRequest());
  }

  joinNewsLetter = () => {

  }

  close = () => {

  }

  // TODO
  installExtension = (name) => {

  }

  startNewDocument = (option) => {
    this.setState({ selectedStarterOption: option });
  }

  onOpenExistingProject = (event: React.SyntheticEvent<any>) => {
    const file = event.currentTarget.files[0] as File;
    OpenWorkspaceRequest.dispatch(file.path, this.bus);
  }

  selectDirectory = async () => {
    this.setState({
      selectedStarterOption: this.state.selectedStarterOption,
      cwd: await SelectDirectoryRequest.dispatch(this.bus)
    });
  }

  render() {
    this._store.projectStarterOptions;

    return <div className="welcome">
      <div className="info">
        <i className="ion-close" onClick={this.close}></i>
        <h2 className="header">Welcome to Tandem</h2>
        <ul>
          <li><a href="#" onClick={this.getStarted}>Getting started</a></li>
          <li><a href="#" onClick={this.getStarted}>Key Commands</a></li>
          <li><a href="#" onClick={this.joinNewsLetter}>Join newsletter</a></li>
          <li><a href="#" onClick={this.installExtension.bind(this, "vscode")}>Install VSCode Extension</a></li>
        </ul>
      </div>
      { this.state.selectedStarterOption ? this.renderSelectedStarterOption() : this.renderStarterOptions() }
    </div>;
  }

  renderSelectedStarterOption() {
    return <div className="rightbar">
      <div className="directory-options">
        <div className="row">
          <div className="col-4">
            Select a directory:
          </div>
        </div>
        <div className="row">
          <div className="col-8">
            <input type="text" value={this.state.cwd} />
          </div>
          <div className="col-2">
            <a href="#" className="button" onClick={this.selectDirectory}>browser</a>
          </div>
          <div className="col-2">
          </div>
        </div>
      </div>
    </div>
  }

  renderStarterOptions() {
    return <div className="rightbar">
      <div className="options">

        <h2 className="header">Start a New Project</h2>

        <ul>
          { this._store.projectStarterOptions.map((option, index) => {
            return <li key={index}>
              <div className={cx({ inner: true, disable: !option.enabled })} onClick={option.enabled && this.startNewDocument.bind(this, option)}>
                <div className="image" style={{ backgroundImage: `url(${option.image})` }} />
                <div className="label">
                  { option.label }
                </div>
              </div>
            </li>;
          }) }
        </ul>

      </div>
      <div className="footer">
        <FileInputComponent accept=".tandem" label="Open existing project" onChange={this.onOpenExistingProject} />
      </div>
    </div>
  }
}