import qs =  require("qs");

import { RouteFactoryProvider } from "@tandem/editor/browser/providers";
import { RedirectRequest, DidRedirectMessage } from "@tandem/editor/browser/messages";
import { IMessage } from "@tandem/mesh";
import { 
  Kernel, 
  inject, 
  bindable, 
  Observable, 
  PropertyMutation, 
  KernelProvider, 
  PropertyWatcher,
  IBrokerBus,
  PrivateBusProvider,
} from "@tandem/common";

export interface IRouterState {
  [Identifier: string]: string
}

export interface IRouteHandlerLoadResult {
  redirect?: RedirectRequest;
  state?: IRouterState;
}


export interface IRouteHandler {
  load(request: RedirectRequest): Promise<IRouteHandlerLoadResult>;
}

export abstract class BaseRouteHandler implements IRouteHandler {
  @inject(PrivateBusProvider.ID)
  protected bus: IBrokerBus;

  @inject(KernelProvider.ID)
  protected kernel: Kernel;
  
  abstract load(request: RedirectRequest): Promise<IRouteHandlerLoadResult>;
}

export class Router extends Observable {

  @inject(KernelProvider.ID)
  private _kernel: Kernel;

  @inject(PrivateBusProvider.ID)
  private _bus: IBrokerBus;

  private _state: IRouterState = {};
  private _path: string;

  readonly stateWatcher: PropertyWatcher<Router, IRouterState>;
  readonly currentPathWatcher: PropertyWatcher<Router, string>;

  constructor() {
    super();
    this.stateWatcher = new PropertyWatcher<Router, IRouterState>(this, "state");
    this.currentPathWatcher = new PropertyWatcher<Router, string>(this, "currentPath");
  }

  get state() {
    return this._state;
  }

  get currentPath() {
    return this._path;
  }

  private setState(path: string, state: any) {
    const oldState = this._state;
    const oldPath  = this._path;
    this._state = state;
    this.notify(new PropertyMutation(PropertyMutation.PROPERTY_CHANGE, this, "state", state, oldState).toEvent());
    this.notify(new PropertyMutation(PropertyMutation.PROPERTY_CHANGE, this, "currentPath", path, oldPath).toEvent());
  }

  async redirect(request: RedirectRequest) {

    // do nothing with params for now

    let path: string = request.routeNameOrPath;

    const routeProvider = RouteFactoryProvider.findByPath(request.routeNameOrPath, this._kernel);
    if (!routeProvider) throw new Error(`Route ${request.routeNameOrPath} does not exist`);
    
    const route = routeProvider.create();
    const params = routeProvider.getParams(path);

    if (Object.keys(params).length) {
      request.params = params;
    }

    if (request.query && Object.keys(request.query).length) path += "?" + qs.stringify(request.query);

    const result = await route.load(request);
    if (result.redirect) return this.redirect(result.redirect);

    this.setState(path, result.state);

    this._bus.dispatch(new DidRedirectMessage(path, result.state)); 
  }
}
