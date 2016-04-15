'use strict';"use strict";
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var constants_1 = require('./constants');
var o = require('../output/output_ast');
var compile_method_1 = require('./compile_method');
var expression_converter_1 = require('./expression_converter');
var compile_binding_1 = require('./compile_binding');
var CompileEventListener = (function () {
    function CompileEventListener(compileElement, eventTarget, eventName, listenerIndex) {
        this.compileElement = compileElement;
        this.eventTarget = eventTarget;
        this.eventName = eventName;
        this._hasComponentHostListener = false;
        this._actionResultExprs = [];
        this._method = new compile_method_1.CompileMethod(compileElement.view);
        this._methodName =
            "_handle_" + santitizeEventName(eventName) + "_" + compileElement.nodeIndex + "_" + listenerIndex;
        this._eventParam =
            new o.FnParam(constants_1.EventHandlerVars.event.name, o.importType(this.compileElement.view.genConfig.renderTypes.renderEvent));
    }
    CompileEventListener.getOrCreate = function (compileElement, eventTarget, eventName, targetEventListeners) {
        var listener = targetEventListeners.find(function (listener) { return listener.eventTarget == eventTarget &&
            listener.eventName == eventName; });
        if (lang_1.isBlank(listener)) {
            listener = new CompileEventListener(compileElement, eventTarget, eventName, targetEventListeners.length);
            targetEventListeners.push(listener);
        }
        return listener;
    };
    CompileEventListener.prototype.addAction = function (hostEvent, directive, directiveInstance) {
        if (lang_1.isPresent(directive) && directive.isComponent) {
            this._hasComponentHostListener = true;
        }
        this._method.resetDebugInfo(this.compileElement.nodeIndex, hostEvent);
        var context = lang_1.isPresent(directiveInstance) ? directiveInstance : o.THIS_EXPR.prop('context');
        var actionStmts = expression_converter_1.convertCdStatementToIr(this.compileElement.view, context, hostEvent.handler);
        var lastIndex = actionStmts.length - 1;
        if (lastIndex >= 0) {
            var lastStatement = actionStmts[lastIndex];
            var returnExpr = convertStmtIntoExpression(lastStatement);
            var preventDefaultVar = o.variable("pd_" + this._actionResultExprs.length);
            this._actionResultExprs.push(preventDefaultVar);
            if (lang_1.isPresent(returnExpr)) {
                // Note: We need to cast the result of the method call to dynamic,
                // as it might be a void method!
                actionStmts[lastIndex] =
                    preventDefaultVar.set(returnExpr.cast(o.DYNAMIC_TYPE).notIdentical(o.literal(false)))
                        .toDeclStmt(null, [o.StmtModifier.Final]);
            }
        }
        this._method.addStmts(actionStmts);
    };
    CompileEventListener.prototype.finishMethod = function () {
        var markPathToRootStart = this._hasComponentHostListener ?
            this.compileElement.getOrCreateAppElement().prop('componentView') :
            o.THIS_EXPR;
        var resultExpr = o.literal(true);
        this._actionResultExprs.forEach(function (expr) { resultExpr = resultExpr.and(expr); });
        var stmts = [markPathToRootStart.callMethod('markPathToRootAsCheckOnce', []).toStmt()]
            .concat(this._method.finish())
            .concat([new o.ReturnStatement(resultExpr)]);
        this.compileElement.view.eventHandlerMethods.push(new o.ClassMethod(this._methodName, [this._eventParam], stmts, o.BOOL_TYPE, [o.StmtModifier.Private]));
    };
    CompileEventListener.prototype.listenToRenderer = function () {
        var listenExpr;
        var eventListener = o.THIS_EXPR.callMethod('eventHandler', [
            o.fn([this._eventParam], [
                new o.ReturnStatement(o.THIS_EXPR.callMethod(this._methodName, [constants_1.EventHandlerVars.event]))
            ])
        ]);
        if (lang_1.isPresent(this.eventTarget)) {
            listenExpr = constants_1.ViewProperties.renderer.callMethod('listenGlobal', [o.literal(this.eventTarget), o.literal(this.eventName), eventListener]);
        }
        else {
            listenExpr = constants_1.ViewProperties.renderer.callMethod('listen', [this.compileElement.renderNode, o.literal(this.eventName), eventListener]);
        }
        var disposable = o.variable("disposable_" + this.compileElement.view.disposables.length);
        this.compileElement.view.disposables.push(disposable);
        this.compileElement.view.createMethod.addStmt(disposable.set(listenExpr).toDeclStmt(o.FUNCTION_TYPE, [o.StmtModifier.Private]));
    };
    CompileEventListener.prototype.listenToDirective = function (directiveInstance, observablePropName) {
        var subscription = o.variable("subscription_" + this.compileElement.view.subscriptions.length);
        this.compileElement.view.subscriptions.push(subscription);
        var eventListener = o.THIS_EXPR.callMethod('eventHandler', [
            o.fn([this._eventParam], [o.THIS_EXPR.callMethod(this._methodName, [constants_1.EventHandlerVars.event]).toStmt()])
        ]);
        this.compileElement.view.createMethod.addStmt(subscription.set(directiveInstance.prop(observablePropName)
            .callMethod(o.BuiltinMethod.SubscribeObservable, [eventListener]))
            .toDeclStmt(null, [o.StmtModifier.Final]));
    };
    return CompileEventListener;
}());
exports.CompileEventListener = CompileEventListener;
function collectEventListeners(hostEvents, dirs, compileElement) {
    var eventListeners = [];
    hostEvents.forEach(function (hostEvent) {
        compileElement.view.bindings.push(new compile_binding_1.CompileBinding(compileElement, hostEvent));
        var listener = CompileEventListener.getOrCreate(compileElement, hostEvent.target, hostEvent.name, eventListeners);
        listener.addAction(hostEvent, null, null);
    });
    collection_1.ListWrapper.forEachWithIndex(dirs, function (directiveAst, i) {
        var directiveInstance = compileElement.directiveInstances[i];
        directiveAst.hostEvents.forEach(function (hostEvent) {
            compileElement.view.bindings.push(new compile_binding_1.CompileBinding(compileElement, hostEvent));
            var listener = CompileEventListener.getOrCreate(compileElement, hostEvent.target, hostEvent.name, eventListeners);
            listener.addAction(hostEvent, directiveAst.directive, directiveInstance);
        });
    });
    eventListeners.forEach(function (listener) { return listener.finishMethod(); });
    return eventListeners;
}
exports.collectEventListeners = collectEventListeners;
function bindDirectiveOutputs(directiveAst, directiveInstance, eventListeners) {
    collection_1.StringMapWrapper.forEach(directiveAst.directive.outputs, function (eventName, observablePropName) {
        eventListeners.filter(function (listener) { return listener.eventName == eventName; })
            .forEach(function (listener) { listener.listenToDirective(directiveInstance, observablePropName); });
    });
}
exports.bindDirectiveOutputs = bindDirectiveOutputs;
function bindRenderOutputs(eventListeners) {
    eventListeners.forEach(function (listener) { return listener.listenToRenderer(); });
}
exports.bindRenderOutputs = bindRenderOutputs;
function convertStmtIntoExpression(stmt) {
    if (stmt instanceof o.ExpressionStatement) {
        return stmt.expr;
    }
    else if (stmt instanceof o.ReturnStatement) {
        return stmt.value;
    }
    return null;
}
function santitizeEventName(name) {
    return lang_1.StringWrapper.replaceAll(name, /[^a-zA-Z_]/g, '_');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRfYmluZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1paGdMeUY5dy50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3ZpZXdfY29tcGlsZXIvZXZlbnRfYmluZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxxQkFBZ0QsMEJBQTBCLENBQUMsQ0FBQTtBQUMzRSwyQkFBNEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUM3RSwwQkFBK0MsYUFBYSxDQUFDLENBQUE7QUFFN0QsSUFBWSxDQUFDLFdBQU0sc0JBQXNCLENBQUMsQ0FBQTtBQUUxQywrQkFBNEIsa0JBQWtCLENBQUMsQ0FBQTtBQUsvQyxxQ0FBcUMsd0JBQXdCLENBQUMsQ0FBQTtBQUM5RCxnQ0FBNkIsbUJBQW1CLENBQUMsQ0FBQTtBQUVqRDtJQW1CRSw4QkFBbUIsY0FBOEIsRUFBUyxXQUFtQixFQUMxRCxTQUFpQixFQUFFLGFBQXFCO1FBRHhDLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtRQUFTLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1FBQzFELGNBQVMsR0FBVCxTQUFTLENBQVE7UUFsQjVCLDhCQUF5QixHQUFZLEtBQUssQ0FBQztRQUczQyx1QkFBa0IsR0FBbUIsRUFBRSxDQUFDO1FBZ0I5QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksOEJBQWEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLFdBQVc7WUFDWixhQUFXLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxTQUFJLGNBQWMsQ0FBQyxTQUFTLFNBQUksYUFBZSxDQUFDO1FBQzVGLElBQUksQ0FBQyxXQUFXO1lBQ1osSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLDRCQUFnQixDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQzNCLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxD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QU8sQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxVQUFDLFNBQVMsRUFBRSxrQkFBa0I7UUFDckYsY0FBYyxDQUFDLE1BQU0sQ0FBQyxVQUFBLFFBQVEsSUFBSSxPQUFBLFFBQVEsQ0FBQyxTQUFTLElBQUksU0FBUyxFQUEvQixDQUErQixDQUFDO2FBQzdELE9BQU8sQ0FDSixVQUFDLFFBQVEsSUFBTyxRQUFRLENBQUMsaUJBQWlCLENBQUMsaUJBQWlCLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2hHLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQVBlLDRCQUFvQix1QkFPbkMsQ0FBQTtBQUVELDJCQUFrQyxjQUFzQztJQUN0RSxjQUFjLENBQUMsT0FBTyxDQUFDLFVBQUEsUUFBUSxJQUFJLE9BQUEsUUFBUSxDQUFDLGdCQUFnQixFQUFFLEVBQTNCLENBQTJCLENBQUMsQ0FBQztBQUNsRSxDQUFDO0FBRmUseUJBQWlCLG9CQUVoQyxDQUFBO0FBRUQsbUNBQW1DLElBQWlCO0lBQ2xELEVBQUUsQ0FBQyxDQUFDLElBQUksWUFBWSxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1FBQzFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ25CLENBQUM7SUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxZQUFZLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQzdDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3BCLENBQUM7SUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVELDRCQUE0QixJQUFZO0lBQ3RDLE1BQU0sQ0FBQyxvQkFBYSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzVELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzQmxhbmssIGlzUHJlc2VudCwgU3RyaW5nV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7TGlzdFdyYXBwZXIsIFN0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge0V2ZW50SGFuZGxlclZhcnMsIFZpZXdQcm9wZXJ0aWVzfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtDb21waWxlRWxlbWVudH0gZnJvbSAnLi9jb21waWxlX2VsZW1lbnQnO1xuaW1wb3J0IHtDb21waWxlTWV0aG9kfSBmcm9tICcuL2NvbXBpbGVfbWV0aG9kJztcblxuaW1wb3J0IHtCb3VuZEV2ZW50QXN0LCBEaXJlY3RpdmVBc3R9IGZyb20gJy4uL3RlbXBsYXRlX2FzdCc7XG5pbXBvcnQge0NvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YX0gZnJvbSAnLi4vY29tcGlsZV9tZXRhZGF0YSc7XG5cbmltcG9ydCB7Y29udmVydENkU3RhdGVtZW50VG9Jcn0gZnJvbSAnLi9leHByZXNzaW9uX2NvbnZlcnRlcic7XG5pbXBvcnQge0NvbXBpbGVCaW5kaW5nfSBmcm9tICcuL2NvbXBpbGVfYmluZGluZyc7XG5cbmV4cG9ydCBjbGFzcyBDb21waWxlRXZlbnRMaXN0ZW5lciB7XG4gIHByaXZhdGUgX21ldGhvZDogQ29tcGlsZU1ldGhvZDtcbiAgcHJpdmF0ZSBfaGFzQ29tcG9uZW50SG9zdExpc3RlbmVyOiBib29sZWFuID0gZmFsc2U7XG4gIHByaXZhdGUgX21ldGhvZE5hbWU6IHN0cmluZztcbiAgcHJpdmF0ZSBfZXZlbnRQYXJhbTogby5GblBhcmFtO1xuICBwcml2YXRlIF9hY3Rpb25SZXN1bHRFeHByczogby5FeHByZXNzaW9uW10gPSBbXTtcblxuICBzdGF0aWMgZ2V0T3JDcmVhdGUoY29tcGlsZUVsZW1lbnQ6IENvbXBpbGVFbGVtZW50LCBldmVudFRhcmdldDogc3RyaW5nLCBldmVudE5hbWU6IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgIHRhcmdldEV2ZW50TGlzdGVuZXJzOiBDb21waWxlRXZlbnRMaXN0ZW5lcltdKTogQ29tcGlsZUV2ZW50TGlzdGVuZXIge1xuICAgIHZhciBsaXN0ZW5lciA9IHRhcmdldEV2ZW50TGlzdGVuZXJzLmZpbmQobGlzdGVuZXIgPT4gbGlzdGVuZXIuZXZlbnRUYXJnZXQgPT0gZXZlbnRUYXJnZXQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RlbmVyLmV2ZW50TmFtZSA9PSBldmVudE5hbWUpO1xuICAgIGlmIChpc0JsYW5rKGxpc3RlbmVyKSkge1xuICAgICAgbGlzdGVuZXIgPSBuZXcgQ29tcGlsZUV2ZW50TGlzdGVuZXIoY29tcGlsZUVsZW1lbnQsIGV2ZW50VGFyZ2V0LCBldmVudE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRFdmVudExpc3RlbmVycy5sZW5ndGgpO1xuICAgICAgdGFyZ2V0RXZlbnRMaXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG4gICAgfVxuICAgIHJldHVybiBsaXN0ZW5lcjtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBjb21waWxlRWxlbWVudDogQ29tcGlsZUVsZW1lbnQsIHB1YmxpYyBldmVudFRhcmdldDogc3RyaW5nLFxuICAgICAgICAgICAgICBwdWJsaWMgZXZlbnROYW1lOiBzdHJpbmcsIGxpc3RlbmVySW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMuX21ldGhvZCA9IG5ldyBDb21waWxlTWV0aG9kKGNvbXBpbGVFbGVtZW50LnZpZXcpO1xuICAgIHRoaXMuX21ldGhvZE5hbWUgPVxuICAgICAgICBgX2hhbmRsZV8ke3NhbnRpdGl6ZUV2ZW50TmFtZShldmVudE5hbWUpfV8ke2NvbXBpbGVFbGVtZW50Lm5vZGVJbmRleH1fJHtsaXN0ZW5lckluZGV4fWA7XG4gICAgdGhpcy5fZXZlbnRQYXJhbSA9XG4gICAgICAgIG5ldyBvLkZuUGFyYW0oRXZlbnRIYW5kbGVyVmFycy5ldmVudC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgIG8uaW1wb3J0VHlwZSh0aGlzLmNvbXBpbGVFbGVtZW50LnZpZXcuZ2VuQ29uZmlnLnJlbmRlclR5cGVzLnJlbmRlckV2ZW50KSk7XG4gIH1cblxuICBhZGRBY3Rpb24oaG9zdEV2ZW50OiBCb3VuZEV2ZW50QXN0LCBkaXJlY3RpdmU6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSxcbiAgICAgICAgICAgIGRpcmVjdGl2ZUluc3RhbmNlOiBvLkV4cHJlc3Npb24pIHtcbiAgICBpZiAoaXNQcmVzZW50KGRpcmVjdGl2ZSkgJiYgZGlyZWN0aXZlLmlzQ29tcG9uZW50KSB7XG4gICAgICB0aGlzLl9oYXNDb21wb25lbnRIb3N0TGlzdGVuZXIgPSB0cnVlO1xuICAgIH1cbiAgICB0aGlzLl9tZXRob2QucmVzZXREZWJ1Z0luZm8odGhpcy5jb21waWxlRWxlbWVudC5ub2RlSW5kZXgsIGhvc3RFdmVudCk7XG4gICAgdmFyIGNvbnRleHQgPSBpc1ByZXNlbnQoZGlyZWN0aXZlSW5zdGFuY2UpID8gZGlyZWN0aXZlSW5zdGFuY2UgOiBvLlRISVNfRVhQUi5wcm9wKCdjb250ZXh0Jyk7XG4gICAgdmFyIGFjdGlvblN0bXRzID0gY29udmVydENkU3RhdGVtZW50VG9Jcih0aGlzLmNvbXBpbGVFbGVtZW50LnZpZXcsIGNvbnRleHQsIGhvc3RFdmVudC5oYW5kbGVyKTtcbiAgICB2YXIgbGFzdEluZGV4ID0gYWN0aW9uU3RtdHMubGVuZ3RoIC0gMTtcbiAgICBpZiAobGFzdEluZGV4ID49IDApIHtcbiAgICAgIHZhciBsYXN0U3RhdGVtZW50ID0gYWN0aW9uU3RtdHNbbGFzdEluZGV4XTtcbiAgICAgIHZhciByZXR1cm5FeHByID0gY29udmVydFN0bXRJbnRvRXhwcmVzc2lvbihsYXN0U3RhdGVtZW50KTtcbiAgICAgIHZhciBwcmV2ZW50RGVmYXVsdFZhciA9IG8udmFyaWFibGUoYHBkXyR7dGhpcy5fYWN0aW9uUmVzdWx0RXhwcnMubGVuZ3RofWApO1xuICAgICAgdGhpcy5fYWN0aW9uUmVzdWx0RXhwcnMucHVzaChwcmV2ZW50RGVmYXVsdFZhcik7XG4gICAgICBpZiAoaXNQcmVzZW50KHJldHVybkV4cHIpKSB7XG4gICAgICAgIC8vIE5vdGU6IFdlIG5lZWQgdG8gY2FzdCB0aGUgcmVzdWx0IG9mIHRoZSBtZXRob2QgY2FsbCB0byBkeW5hbWljLFxuICAgICAgICAvLyBhcyBpdCBtaWdodCBiZSBhIHZvaWQgbWV0aG9kIVxuICAgICAgICBhY3Rpb25TdG10c1tsYXN0SW5kZXhdID1cbiAgICAgICAgICAgIHByZXZlbnREZWZhdWx0VmFyLnNldChyZXR1cm5FeHByLmNhc3Qoby5EWU5BTUlDX1RZUEUpLm5vdElkZW50aWNhbChvLmxpdGVyYWwoZmFsc2UpKSlcbiAgICAgICAgICAgICAgICAudG9EZWNsU3RtdChudWxsLCBbby5TdG10TW9kaWZpZXIuRmluYWxdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fbWV0aG9kLmFkZFN0bXRzKGFjdGlvblN0bXRzKTtcbiAgfVxuXG4gIGZpbmlzaE1ldGhvZCgpIHtcbiAgICB2YXIgbWFya1BhdGhUb1Jvb3RTdGFydCA9XG4gICAgICAgIHRoaXMuX2hhc0NvbXBvbmVudEhvc3RMaXN0ZW5lciA/XG4gICAgICAgICAgICB0aGlzLmNvbXBpbGVFbGVtZW50LmdldE9yQ3JlYXRlQXBwRWxlbWVudCgpLnByb3AoJ2NvbXBvbmVudFZpZXcnKSA6XG4gICAgICAgICAgICBvLlRISVNfRVhQUjtcbiAgICB2YXIgcmVzdWx0RXhwcjogby5FeHByZXNzaW9uID0gby5saXRlcmFsKHRydWUpO1xuICAgIHRoaXMuX2FjdGlvblJlc3VsdEV4cHJzLmZvckVhY2goKGV4cHIpID0+IHsgcmVzdWx0RXhwciA9IHJlc3VsdEV4cHIuYW5kKGV4cHIpOyB9KTtcbiAgICB2YXIgc3RtdHMgPVxuICAgICAgICAoPG8uU3RhdGVtZW50W10+W21hcmtQYXRoVG9Sb290U3RhcnQuY2FsbE1ldGhvZCgnbWFya1BhdGhUb1Jvb3RBc0NoZWNrT25jZScsIFtdKS50b1N0bXQoKV0pXG4gICAgICAgICAgICAuY29uY2F0KHRoaXMuX21ldGhvZC5maW5pc2goKSlcbiAgICAgICAgICAgIC5jb25jYXQoW25ldyBvLlJldHVyblN0YXRlbWVudChyZXN1bHRFeHByKV0pO1xuICAgIHRoaXMuY29tcGlsZUVsZW1lbnQudmlldy5ldmVudEhhbmRsZXJNZXRob2RzLnB1c2gobmV3IG8uQ2xhc3NNZXRob2QoXG4gICAgICAgIHRoaXMuX21ldGhvZE5hbWUsIFt0aGlzLl9ldmVudFBhcmFtXSwgc3RtdHMsIG8uQk9PTF9UWVBFLCBbby5TdG10TW9kaWZpZXIuUHJpdmF0ZV0pKTtcbiAgfVxuXG4gIGxpc3RlblRvUmVuZGVyZXIoKSB7XG4gICAgdmFyIGxpc3RlbkV4cHI7XG4gICAgdmFyIGV2ZW50TGlzdGVuZXIgPSBvLlRISVNfRVhQUi5jYWxsTWV0aG9kKCdldmVudEhhbmRsZXInLCBbXG4gICAgICBvLmZuKFt0aGlzLl9ldmVudFBhcmFtXSxcbiAgICAgICAgICAgW1xuICAgICAgICAgICAgIG5ldyBvLlJldHVyblN0YXRlbWVudChcbiAgICAgICAgICAgICAgICAgby5USElTX0VYUFIuY2FsbE1ldGhvZCh0aGlzLl9tZXRob2ROYW1lLCBbRXZlbnRIYW5kbGVyVmFycy5ldmVudF0pKVxuICAgICAgICAgICBdKVxuICAgIF0pO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5ldmVudFRhcmdldCkpIHtcbiAgICAgIGxpc3RlbkV4cHIgPSBWaWV3UHJvcGVydGllcy5yZW5kZXJlci5jYWxsTWV0aG9kKFxuICAgICAgICAgICdsaXN0ZW5HbG9iYWwnLCBbby5saXRlcmFsKHRoaXMuZXZlbnRUYXJnZXQpLCBvLmxpdGVyYWwodGhpcy5ldmVudE5hbWUpLCBldmVudExpc3RlbmVyXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3RlbkV4cHIgPSBWaWV3UHJvcGVydGllcy5yZW5kZXJlci5jYWxsTWV0aG9kKFxuICAgICAgICAgICdsaXN0ZW4nLCBbdGhpcy5jb21waWxlRWxlbWVudC5yZW5kZXJOb2RlLCBvLmxpdGVyYWwodGhpcy5ldmVudE5hbWUpLCBldmVudExpc3RlbmVyXSk7XG4gICAgfVxuICAgIHZhciBkaXNwb3NhYmxlID0gby52YXJpYWJsZShgZGlzcG9zYWJsZV8ke3RoaXMuY29tcGlsZUVsZW1lbnQudmlldy5kaXNwb3NhYmxlcy5sZW5ndGh9YCk7XG4gICAgdGhpcy5jb21waWxlRWxlbWVudC52aWV3LmRpc3Bvc2FibGVzLnB1c2goZGlzcG9zYWJsZSk7XG4gICAgdGhpcy5jb21waWxlRWxlbWVudC52aWV3LmNyZWF0ZU1ldGhvZC5hZGRTdG10KFxuICAgICAgICBkaXNwb3NhYmxlLnNldChsaXN0ZW5FeHByKS50b0RlY2xTdG10KG8uRlVOQ1RJT05fVFlQRSwgW28uU3RtdE1vZGlmaWVyLlByaXZhdGVdKSk7XG4gIH1cblxuICBsaXN0ZW5Ub0RpcmVjdGl2ZShkaXJlY3RpdmVJbnN0YW5jZTogby5FeHByZXNzaW9uLCBvYnNlcnZhYmxlUHJvcE5hbWU6IHN0cmluZykge1xuICAgIHZhciBzdWJzY3JpcHRpb24gPSBvLnZhcmlhYmxlKGBzdWJzY3JpcHRpb25fJHt0aGlzLmNvbXBpbGVFbGVtZW50LnZpZXcuc3Vic2NyaXB0aW9ucy5sZW5ndGh9YCk7XG4gICAgdGhpcy5jb21waWxlRWxlbWVudC52aWV3LnN1YnNjcmlwdGlvbnMucHVzaChzdWJzY3JpcHRpb24pO1xuICAgIHZhciBldmVudExpc3RlbmVyID0gby5USElTX0VYUFIuY2FsbE1ldGhvZCgnZXZlbnRIYW5kbGVyJywgW1xuICAgICAgby5mbihbdGhpcy5fZXZlbnRQYXJhbV0sXG4gICAgICAgICAgIFtvLlRISVNfRVhQUi5jYWxsTWV0aG9kKHRoaXMuX21ldGhvZE5hbWUsIFtFdmVudEhhbmRsZXJWYXJzLmV2ZW50XSkudG9TdG10KCldKVxuICAgIF0pO1xuICAgIHRoaXMuY29tcGlsZUVsZW1lbnQudmlldy5jcmVhdGVNZXRob2QuYWRkU3RtdChcbiAgICAgICAgc3Vic2NyaXB0aW9uLnNldChkaXJlY3RpdmVJbnN0YW5jZS5wcm9wKG9ic2VydmFibGVQcm9wTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhbGxNZXRob2Qoby5CdWlsdGluTWV0aG9kLlN1YnNjcmliZU9ic2VydmFibGUsIFtldmVudExpc3RlbmVyXSkpXG4gICAgICAgICAgICAudG9EZWNsU3RtdChudWxsLCBbby5TdG10TW9kaWZpZXIuRmluYWxdKSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbGxlY3RFdmVudExpc3RlbmVycyhob3N0RXZlbnRzOiBCb3VuZEV2ZW50QXN0W10sIGRpcnM6IERpcmVjdGl2ZUFzdFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlRWxlbWVudDogQ29tcGlsZUVsZW1lbnQpOiBDb21waWxlRXZlbnRMaXN0ZW5lcltdIHtcbiAgdmFyIGV2ZW50TGlzdGVuZXJzOiBDb21waWxlRXZlbnRMaXN0ZW5lcltdID0gW107XG4gIGhvc3RFdmVudHMuZm9yRWFjaCgoaG9zdEV2ZW50KSA9PiB7XG4gICAgY29tcGlsZUVsZW1lbnQudmlldy5iaW5kaW5ncy5wdXNoKG5ldyBDb21waWxlQmluZGluZyhjb21waWxlRWxlbWVudCwgaG9zdEV2ZW50KSk7XG4gICAgdmFyIGxpc3RlbmVyID0gQ29tcGlsZUV2ZW50TGlzdGVuZXIuZ2V0T3JDcmVhdGUoY29tcGlsZUVsZW1lbnQsIGhvc3RFdmVudC50YXJnZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9zdEV2ZW50Lm5hbWUsIGV2ZW50TGlzdGVuZXJzKTtcbiAgICBsaXN0ZW5lci5hZGRBY3Rpb24oaG9zdEV2ZW50LCBudWxsLCBudWxsKTtcbiAgfSk7XG4gIExpc3RXcmFwcGVyLmZvckVhY2hXaXRoSW5kZXgoZGlycywgKGRpcmVjdGl2ZUFzdCwgaSkgPT4ge1xuICAgIHZhciBkaXJlY3RpdmVJbnN0YW5jZSA9IGNvbXBpbGVFbGVtZW50LmRpcmVjdGl2ZUluc3RhbmNlc1tpXTtcbiAgICBkaXJlY3RpdmVBc3QuaG9zdEV2ZW50cy5mb3JFYWNoKChob3N0RXZlbnQpID0+IHtcbiAgICAgIGNvbXBpbGVFbGVtZW50LnZpZXcuYmluZGluZ3MucHVzaChuZXcgQ29tcGlsZUJpbmRpbmcoY29tcGlsZUVsZW1lbnQsIGhvc3RFdmVudCkpO1xuICAgICAgdmFyIGxpc3RlbmVyID0gQ29tcGlsZUV2ZW50TGlzdGVuZXIuZ2V0T3JDcmVhdGUoY29tcGlsZUVsZW1lbnQsIGhvc3RFdmVudC50YXJnZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBob3N0RXZlbnQubmFtZSwgZXZlbnRMaXN0ZW5lcnMpO1xuICAgICAgbGlzdGVuZXIuYWRkQWN0aW9uKGhvc3RFdmVudCwgZGlyZWN0aXZlQXN0LmRpcmVjdGl2ZSwgZGlyZWN0aXZlSW5zdGFuY2UpO1xuICAgIH0pO1xuICB9KTtcbiAgZXZlbnRMaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IGxpc3RlbmVyLmZpbmlzaE1ldGhvZCgpKTtcbiAgcmV0dXJuIGV2ZW50TGlzdGVuZXJzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmluZERpcmVjdGl2ZU91dHB1dHMoZGlyZWN0aXZlQXN0OiBEaXJlY3RpdmVBc3QsIGRpcmVjdGl2ZUluc3RhbmNlOiBvLkV4cHJlc3Npb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRMaXN0ZW5lcnM6IENvbXBpbGVFdmVudExpc3RlbmVyW10pIHtcbiAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKGRpcmVjdGl2ZUFzdC5kaXJlY3RpdmUub3V0cHV0cywgKGV2ZW50TmFtZSwgb2JzZXJ2YWJsZVByb3BOYW1lKSA9PiB7XG4gICAgZXZlbnRMaXN0ZW5lcnMuZmlsdGVyKGxpc3RlbmVyID0+IGxpc3RlbmVyLmV2ZW50TmFtZSA9PSBldmVudE5hbWUpXG4gICAgICAgIC5mb3JFYWNoKFxuICAgICAgICAgICAgKGxpc3RlbmVyKSA9PiB7IGxpc3RlbmVyLmxpc3RlblRvRGlyZWN0aXZlKGRpcmVjdGl2ZUluc3RhbmNlLCBvYnNlcnZhYmxlUHJvcE5hbWUpOyB9KTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiaW5kUmVuZGVyT3V0cHV0cyhldmVudExpc3RlbmVyczogQ29tcGlsZUV2ZW50TGlzdGVuZXJbXSkge1xuICBldmVudExpc3RlbmVycy5mb3JFYWNoKGxpc3RlbmVyID0+IGxpc3RlbmVyLmxpc3RlblRvUmVuZGVyZXIoKSk7XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRTdG10SW50b0V4cHJlc3Npb24oc3RtdDogby5TdGF0ZW1lbnQpOiBvLkV4cHJlc3Npb24ge1xuICBpZiAoc3RtdCBpbnN0YW5jZW9mIG8uRXhwcmVzc2lvblN0YXRlbWVudCkge1xuICAgIHJldHVybiBzdG10LmV4cHI7XG4gIH0gZWxzZSBpZiAoc3RtdCBpbnN0YW5jZW9mIG8uUmV0dXJuU3RhdGVtZW50KSB7XG4gICAgcmV0dXJuIHN0bXQudmFsdWU7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIHNhbnRpdGl6ZUV2ZW50TmFtZShuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsKG5hbWUsIC9bXmEtekEtWl9dL2csICdfJyk7XG59Il19