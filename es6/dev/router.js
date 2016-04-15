/**
 * @module
 * @description
 * Maps application URLs into application states, to support deep-linking and navigation.
 */
export { Router } from './src/router/router';
export { RouterOutlet } from './src/router/directives/router_outlet';
export { RouterLink } from './src/router/directives/router_link';
export { RouteParams, RouteData } from './src/router/instruction';
export { PlatformLocation } from './src/router/location/platform_location';
export { RouteRegistry, ROUTER_PRIMARY_COMPONENT } from './src/router/route_registry';
export { LocationStrategy, APP_BASE_HREF } from './src/router/location/location_strategy';
export { HashLocationStrategy } from './src/router/location/hash_location_strategy';
export { PathLocationStrategy } from './src/router/location/path_location_strategy';
export { Location } from './src/router/location/location';
export * from './src/router/route_config/route_config_decorator';
export * from './src/router/route_definition';
export { CanActivate } from './src/router/lifecycle/lifecycle_annotations';
export { Instruction, ComponentInstruction } from './src/router/instruction';
export { OpaqueToken } from 'angular2/core';
export { ROUTER_PROVIDERS_COMMON } from 'angular2/src/router/router_providers_common';
export { ROUTER_PROVIDERS, ROUTER_BINDINGS } from 'angular2/src/router/router_providers';
import { RouterOutlet } from './src/router/directives/router_outlet';
import { RouterLink } from './src/router/directives/router_link';
import { CONST_EXPR } from './src/facade/lang';
/**
 * A list of directives. To use the router directives like {@link RouterOutlet} and
 * {@link RouterLink}, add this to your `directives` array in the {@link View} decorator of your
 * component.
 *
 * ### Example ([live demo](http://plnkr.co/edit/iRUP8B5OUbxCWQ3AcIDm))
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig} from 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *    // ...
 * }
 *
 * bootstrap(AppCmp, [ROUTER_PROVIDERS]);
 * ```
 */
export const ROUTER_DIRECTIVES = CONST_EXPR([RouterOutlet, RouterLink]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1laTRpaEJvOC50bXAvYW5ndWxhcjIvcm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7QUFFSCxTQUFRLE1BQU0sUUFBTyxxQkFBcUIsQ0FBQztBQUMzQyxTQUFRLFlBQVksUUFBTyx1Q0FBdUMsQ0FBQztBQUNuRSxTQUFRLFVBQVUsUUFBTyxxQ0FBcUMsQ0FBQztBQUMvRCxTQUFRLFdBQVcsRUFBRSxTQUFTLFFBQU8sMEJBQTBCLENBQUM7QUFDaEUsU0FBUSxnQkFBZ0IsUUFBTyx5Q0FBeUMsQ0FBQztBQUN6RSxTQUFRLGFBQWEsRUFBRSx3QkFBd0IsUUFBTyw2QkFBNkIsQ0FBQztBQUNwRixTQUFRLGdCQUFnQixFQUFFLGFBQWEsUUFBTyx5Q0FBeUMsQ0FBQztBQUN4RixTQUFRLG9CQUFvQixRQUFPLDhDQUE4QyxDQUFDO0FBQ2xGLFNBQVEsb0JBQW9CLFFBQU8sOENBQThDLENBQUM7QUFDbEYsU0FBUSxRQUFRLFFBQU8sZ0NBQWdDLENBQUM7QUFDeEQsY0FBYyxrREFBa0QsQ0FBQztBQUNqRSxjQUFjLCtCQUErQixDQUFDO0FBRTlDLFNBQVEsV0FBVyxRQUFPLDhDQUE4QyxDQUFDO0FBQ3pFLFNBQVEsV0FBVyxFQUFFLG9CQUFvQixRQUFPLDBCQUEwQixDQUFDO0FBQzNFLFNBQVEsV0FBVyxRQUFPLGVBQWUsQ0FBQztBQUMxQyxTQUFRLHVCQUF1QixRQUFPLDZDQUE2QyxDQUFDO0FBQ3BGLFNBQVEsZ0JBQWdCLEVBQUUsZUFBZSxRQUFPLHNDQUFzQyxDQUFDO09BRWhGLEVBQUMsWUFBWSxFQUFDLE1BQU0sdUNBQXVDO09BQzNELEVBQUMsVUFBVSxFQUFDLE1BQU0scUNBQXFDO09BQ3ZELEVBQUMsVUFBVSxFQUFDLE1BQU0sbUJBQW1CO0FBRTVDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FxQkc7QUFDSCxPQUFPLE1BQU0saUJBQWlCLEdBQVUsVUFBVSxDQUFDLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBtb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICogTWFwcyBhcHBsaWNhdGlvbiBVUkxzIGludG8gYXBwbGljYXRpb24gc3RhdGVzLCB0byBzdXBwb3J0IGRlZXAtbGlua2luZyBhbmQgbmF2aWdhdGlvbi5cbiAqL1xuXG5leHBvcnQge1JvdXRlcn0gZnJvbSAnLi9zcmMvcm91dGVyL3JvdXRlcic7XG5leHBvcnQge1JvdXRlck91dGxldH0gZnJvbSAnLi9zcmMvcm91dGVyL2RpcmVjdGl2ZXMvcm91dGVyX291dGxldCc7XG5leHBvcnQge1JvdXRlckxpbmt9IGZyb20gJy4vc3JjL3JvdXRlci9kaXJlY3RpdmVzL3JvdXRlcl9saW5rJztcbmV4cG9ydCB7Um91dGVQYXJhbXMsIFJvdXRlRGF0YX0gZnJvbSAnLi9zcmMvcm91dGVyL2luc3RydWN0aW9uJztcbmV4cG9ydCB7UGxhdGZvcm1Mb2NhdGlvbn0gZnJvbSAnLi9zcmMvcm91dGVyL2xvY2F0aW9uL3BsYXRmb3JtX2xvY2F0aW9uJztcbmV4cG9ydCB7Um91dGVSZWdpc3RyeSwgUk9VVEVSX1BSSU1BUllfQ09NUE9ORU5UfSBmcm9tICcuL3NyYy9yb3V0ZXIvcm91dGVfcmVnaXN0cnknO1xuZXhwb3J0IHtMb2NhdGlvblN0cmF0ZWd5LCBBUFBfQkFTRV9IUkVGfSBmcm9tICcuL3NyYy9yb3V0ZXIvbG9jYXRpb24vbG9jYXRpb25fc3RyYXRlZ3knO1xuZXhwb3J0IHtIYXNoTG9jYXRpb25TdHJhdGVneX0gZnJvbSAnLi9zcmMvcm91dGVyL2xvY2F0aW9uL2hhc2hfbG9jYXRpb25fc3RyYXRlZ3knO1xuZXhwb3J0IHtQYXRoTG9jYXRpb25TdHJhdGVneX0gZnJvbSAnLi9zcmMvcm91dGVyL2xvY2F0aW9uL3BhdGhfbG9jYXRpb25fc3RyYXRlZ3knO1xuZXhwb3J0IHtMb2NhdGlvbn0gZnJvbSAnLi9zcmMvcm91dGVyL2xvY2F0aW9uL2xvY2F0aW9uJztcbmV4cG9ydCAqIGZyb20gJy4vc3JjL3JvdXRlci9yb3V0ZV9jb25maWcvcm91dGVfY29uZmlnX2RlY29yYXRvcic7XG5leHBvcnQgKiBmcm9tICcuL3NyYy9yb3V0ZXIvcm91dGVfZGVmaW5pdGlvbic7XG5leHBvcnQge09uQWN0aXZhdGUsIE9uRGVhY3RpdmF0ZSwgT25SZXVzZSwgQ2FuRGVhY3RpdmF0ZSwgQ2FuUmV1c2V9IGZyb20gJy4vc3JjL3JvdXRlci9pbnRlcmZhY2VzJztcbmV4cG9ydCB7Q2FuQWN0aXZhdGV9IGZyb20gJy4vc3JjL3JvdXRlci9saWZlY3ljbGUvbGlmZWN5Y2xlX2Fubm90YXRpb25zJztcbmV4cG9ydCB7SW5zdHJ1Y3Rpb24sIENvbXBvbmVudEluc3RydWN0aW9ufSBmcm9tICcuL3NyYy9yb3V0ZXIvaW5zdHJ1Y3Rpb24nO1xuZXhwb3J0IHtPcGFxdWVUb2tlbn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5leHBvcnQge1JPVVRFUl9QUk9WSURFUlNfQ09NTU9OfSBmcm9tICdhbmd1bGFyMi9zcmMvcm91dGVyL3JvdXRlcl9wcm92aWRlcnNfY29tbW9uJztcbmV4cG9ydCB7Uk9VVEVSX1BST1ZJREVSUywgUk9VVEVSX0JJTkRJTkdTfSBmcm9tICdhbmd1bGFyMi9zcmMvcm91dGVyL3JvdXRlcl9wcm92aWRlcnMnO1xuXG5pbXBvcnQge1JvdXRlck91dGxldH0gZnJvbSAnLi9zcmMvcm91dGVyL2RpcmVjdGl2ZXMvcm91dGVyX291dGxldCc7XG5pbXBvcnQge1JvdXRlckxpbmt9IGZyb20gJy4vc3JjL3JvdXRlci9kaXJlY3RpdmVzL3JvdXRlcl9saW5rJztcbmltcG9ydCB7Q09OU1RfRVhQUn0gZnJvbSAnLi9zcmMvZmFjYWRlL2xhbmcnO1xuXG4vKipcbiAqIEEgbGlzdCBvZiBkaXJlY3RpdmVzLiBUbyB1c2UgdGhlIHJvdXRlciBkaXJlY3RpdmVzIGxpa2Uge0BsaW5rIFJvdXRlck91dGxldH0gYW5kXG4gKiB7QGxpbmsgUm91dGVyTGlua30sIGFkZCB0aGlzIHRvIHlvdXIgYGRpcmVjdGl2ZXNgIGFycmF5IGluIHRoZSB7QGxpbmsgVmlld30gZGVjb3JhdG9yIG9mIHlvdXJcbiAqIGNvbXBvbmVudC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvaVJVUDhCNU9VYnhDV1EzQWNJRG0pKVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtST1VURVJfRElSRUNUSVZFUywgUk9VVEVSX1BST1ZJREVSUywgUm91dGVDb25maWd9IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG4gKlxuICogQENvbXBvbmVudCh7ZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXX0pXG4gKiBAUm91dGVDb25maWcoW1xuICogIHsuLi59LFxuICogXSlcbiAqIGNsYXNzIEFwcENtcCB7XG4gKiAgICAvLyAuLi5cbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwQ21wLCBbUk9VVEVSX1BST1ZJREVSU10pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBST1VURVJfRElSRUNUSVZFUzogYW55W10gPSBDT05TVF9FWFBSKFtSb3V0ZXJPdXRsZXQsIFJvdXRlckxpbmtdKTtcbiJdfQ==