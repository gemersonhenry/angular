'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var html_ast_1 = require('angular2/src/compiler/html_ast');
var message_1 = require('./message');
var html_parser_1 = require('angular2/src/compiler/html_parser');
var parse_util_1 = require('angular2/src/compiler/parse_util');
var _PLACEHOLDER_REGEXP = lang_1.RegExpWrapper.create("\\<ph(\\s)+name=(\"(\\w)+\")\\/\\>");
var _ID_ATTR = "id";
var _MSG_ELEMENT = "msg";
var _BUNDLE_ELEMENT = "message-bundle";
function serializeXmb(messages) {
    var ms = messages.map(function (m) { return _serializeMessage(m); }).join("");
    return "<message-bundle>" + ms + "</message-bundle>";
}
exports.serializeXmb = serializeXmb;
var XmbDeserializationResult = (function () {
    function XmbDeserializationResult(content, messages, errors) {
        this.content = content;
        this.messages = messages;
        this.errors = errors;
    }
    return XmbDeserializationResult;
}());
exports.XmbDeserializationResult = XmbDeserializationResult;
var XmbDeserializationError = (function (_super) {
    __extends(XmbDeserializationError, _super);
    function XmbDeserializationError(span, msg) {
        _super.call(this, span, msg);
    }
    return XmbDeserializationError;
}(parse_util_1.ParseError));
exports.XmbDeserializationError = XmbDeserializationError;
function deserializeXmb(content, url) {
    var parser = new html_parser_1.HtmlParser();
    var normalizedContent = _expandPlaceholder(content.trim());
    var parsed = parser.parse(normalizedContent, url);
    if (parsed.errors.length > 0) {
        return new XmbDeserializationResult(null, {}, parsed.errors);
    }
    if (_checkRootElement(parsed.rootNodes)) {
        return new XmbDeserializationResult(null, {}, [new XmbDeserializationError(null, "Missing element \"" + _BUNDLE_ELEMENT + "\"")]);
    }
    var bundleEl = parsed.rootNodes[0]; // test this
    var errors = [];
    var messages = {};
    _createMessages(bundleEl.children, messages, errors);
    return (errors.length == 0) ?
        new XmbDeserializationResult(normalizedContent, messages, []) :
        new XmbDeserializationResult(null, {}, errors);
}
exports.deserializeXmb = deserializeXmb;
function _checkRootElement(nodes) {
    return nodes.length < 1 || !(nodes[0] instanceof html_ast_1.HtmlElementAst) ||
        nodes[0].name != _BUNDLE_ELEMENT;
}
function _createMessages(nodes, messages, errors) {
    nodes.forEach(function (item) {
        if (item instanceof html_ast_1.HtmlElementAst) {
            var msg = item;
            if (msg.name != _MSG_ELEMENT) {
                errors.push(new XmbDeserializationError(item.sourceSpan, "Unexpected element \"" + msg.name + "\""));
                return;
            }
            var id_1 = _id(msg);
            if (lang_1.isBlank(id_1)) {
                errors.push(new XmbDeserializationError(item.sourceSpan, "\"" + _ID_ATTR + "\" attribute is missing"));
                return;
            }
            messages[id_1] = msg.children;
        }
    });
}
function _id(el) {
    var ids = el.attrs.filter(function (a) { return a.name == _ID_ATTR; });
    return ids.length > 0 ? ids[0].value : null;
}
function _serializeMessage(m) {
    var desc = lang_1.isPresent(m.description) ? " desc='" + m.description + "'" : "";
    return "<msg id='" + message_1.id(m) + "'" + desc + ">" + m.content + "</msg>";
}
function _expandPlaceholder(input) {
    return lang_1.RegExpWrapper.replaceAll(_PLACEHOLDER_REGEXP, input, function (match) {
        var nameWithQuotes = match[2];
        return "<ph name=" + nameWithQuotes + "></ph>";
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieG1iX3NlcmlhbGl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWloZ0x5Rjl3LnRtcC9hbmd1bGFyMi9zcmMvaTE4bi94bWJfc2VyaWFsaXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxxQkFBZ0QsMEJBQTBCLENBQUMsQ0FBQTtBQUMzRSx5QkFBc0MsZ0NBQWdDLENBQUMsQ0FBQTtBQUN2RSx3QkFBMEIsV0FBVyxDQUFDLENBQUE7QUFDdEMsNEJBQXlCLG1DQUFtQyxDQUFDLENBQUE7QUFDN0QsMkJBQTBDLGtDQUFrQyxDQUFDLENBQUE7QUFFN0UsSUFBSSxtQkFBbUIsR0FBRyxvQkFBYSxDQUFDLE1BQU0sQ0FBQyxvQ0FBa0MsQ0FBQyxDQUFDO0FBQ25GLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQztBQUN0QixJQUFNLFlBQVksR0FBRyxLQUFLLENBQUM7QUFDM0IsSUFBTSxlQUFlLEdBQUcsZ0JBQWdCLENBQUM7QUFFekMsc0JBQTZCLFFBQW1CO0lBQzlDLElBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQyxDQUFDLElBQUssT0FBQSxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsRUFBcEIsQ0FBb0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM1RCxNQUFNLENBQUMscUJBQW1CLEVBQUUsc0JBQW1CLENBQUM7QUFDbEQsQ0FBQztBQUhlLG9CQUFZLGVBRzNCLENBQUE7QUFFRDtJQUNFLGtDQUFtQixPQUFlLEVBQVMsUUFBb0MsRUFDNUQsTUFBb0I7UUFEcEIsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUFTLGFBQVEsR0FBUixRQUFRLENBQTRCO1FBQzVELFdBQU0sR0FBTixNQUFNLENBQWM7SUFBRyxDQUFDO0lBQzdDLCtCQUFDO0FBQUQsQ0FBQyxBQUhELElBR0M7QUFIWSxnQ0FBd0IsMkJBR3BDLENBQUE7QUFF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QUUsT0FBSSxRQUFRLDRCQUF3QixDQUFDLENBQUMsQ0FBQztnQkFDeEYsTUFBTSxDQUFDO1lBQ1QsQ0FBQztZQUVELFFBQVEsQ0FBQyxJQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDO1FBQzlCLENBQUM7SUFDSCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCxhQUFhLEVBQWtCO0lBQzdCLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLElBQUksSUFBSSxRQUFRLEVBQWxCLENBQWtCLENBQUMsQ0FBQztJQUNuRCxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDOUMsQ0FBQztBQUVELDJCQUEyQixDQUFVO0lBQ25DLElBQUksSUFBSSxHQUFHLGdCQUFTLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxHQUFHLFlBQVUsQ0FBQyxDQUFDLFdBQVcsTUFBRyxHQUFHLEVBQUUsQ0FBQztJQUN0RSxNQUFNLENBQUMsY0FBWSxZQUFFLENBQUMsQ0FBQyxDQUFDLFNBQUksSUFBSSxTQUFJLENBQUMsQ0FBQyxPQUFPLFdBQVEsQ0FBQztBQUN4RCxDQUFDO0FBRUQsNEJBQTRCLEtBQWE7SUFDdkMsTUFBTSxDQUFDLG9CQUFhLENBQUMsVUFBVSxDQUFDLG1CQUFtQixFQUFFLEtBQUssRUFBRSxVQUFDLEtBQUs7UUFDaEUsSUFBSSxjQUFjLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlCLE1BQU0sQ0FBQyxjQUFZLGNBQWMsV0FBUSxDQUFDO0lBQzVDLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rLCBSZWdFeHBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtIdG1sQXN0LCBIdG1sRWxlbWVudEFzdH0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2h0bWxfYXN0JztcbmltcG9ydCB7TWVzc2FnZSwgaWR9IGZyb20gJy4vbWVzc2FnZSc7XG5pbXBvcnQge0h0bWxQYXJzZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci9odG1sX3BhcnNlcic7XG5pbXBvcnQge1BhcnNlU291cmNlU3BhbiwgUGFyc2VFcnJvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3BhcnNlX3V0aWwnO1xuXG5sZXQgX1BMQUNFSE9MREVSX1JFR0VYUCA9IFJlZ0V4cFdyYXBwZXIuY3JlYXRlKGBcXFxcPHBoKFxcXFxzKStuYW1lPShcIihcXFxcdykrXCIpXFxcXC9cXFxcPmApO1xuY29uc3QgX0lEX0FUVFIgPSBcImlkXCI7XG5jb25zdCBfTVNHX0VMRU1FTlQgPSBcIm1zZ1wiO1xuY29uc3QgX0JVTkRMRV9FTEVNRU5UID0gXCJtZXNzYWdlLWJ1bmRsZVwiO1xuXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplWG1iKG1lc3NhZ2VzOiBNZXNzYWdlW10pOiBzdHJpbmcge1xuICBsZXQgbXMgPSBtZXNzYWdlcy5tYXAoKG0pID0+IF9zZXJpYWxpemVNZXNzYWdlKG0pKS5qb2luKFwiXCIpO1xuICByZXR1cm4gYDxtZXNzYWdlLWJ1bmRsZT4ke21zfTwvbWVzc2FnZS1idW5kbGU+YDtcbn1cblxuZXhwb3J0IGNsYXNzIFhtYkRlc2VyaWFsaXphdGlvblJlc3VsdCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBjb250ZW50OiBzdHJpbmcsIHB1YmxpYyBtZXNzYWdlczoge1trZXk6IHN0cmluZ106IEh0bWxBc3RbXX0sXG4gICAgICAgICAgICAgIHB1YmxpYyBlcnJvcnM6IFBhcnNlRXJyb3JbXSkge31cbn1cblxuZXhwb3J0IGNsYXNzIFhtYkRlc2VyaWFsaXphdGlvbkVycm9yIGV4dGVuZHMgUGFyc2VFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHNwYW46IFBhcnNlU291cmNlU3BhbiwgbXNnOiBzdHJpbmcpIHsgc3VwZXIoc3BhbiwgbXNnKTsgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVzZXJpYWxpemVYbWIoY29udGVudDogc3RyaW5nLCB1cmw6IHN0cmluZyk6IFhtYkRlc2VyaWFsaXphdGlvblJlc3VsdCB7XG4gIGxldCBwYXJzZXIgPSBuZXcgSHRtbFBhcnNlcigpO1xuICBsZXQgbm9ybWFsaXplZENvbnRlbnQgPSBfZXhwYW5kUGxhY2Vob2xkZXIoY29udGVudC50cmltKCkpO1xuICBsZXQgcGFyc2VkID0gcGFyc2VyLnBhcnNlKG5vcm1hbGl6ZWRDb250ZW50LCB1cmwpO1xuXG4gIGlmIChwYXJzZWQuZXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gbmV3IFhtYkRlc2VyaWFsaXphdGlvblJlc3VsdChudWxsLCB7fSwgcGFyc2VkLmVycm9ycyk7XG4gIH1cblxuICBpZiAoX2NoZWNrUm9vdEVsZW1lbnQocGFyc2VkLnJvb3ROb2RlcykpIHtcbiAgICByZXR1cm4gbmV3IFhtYkRlc2VyaWFsaXphdGlvblJlc3VsdChcbiAgICAgICAgbnVsbCwge30sIFtuZXcgWG1iRGVzZXJpYWxpemF0aW9uRXJyb3IobnVsbCwgYE1pc3NpbmcgZWxlbWVudCBcIiR7X0JVTkRMRV9FTEVNRU5UfVwiYCldKTtcbiAgfVxuXG4gIGxldCBidW5kbGVFbCA9IDxIdG1sRWxlbWVudEFzdD5wYXJzZWQucm9vdE5vZGVzWzBdOyAgLy8gdGVzdCB0aGlzXG4gIGxldCBlcnJvcnMgPSBbXTtcbiAgbGV0IG1lc3NhZ2VzOiB7W2tleTogc3RyaW5nXTogSHRtbEFzdFtdfSA9IHt9O1xuXG4gIF9jcmVhdGVNZXNzYWdlcyhidW5kbGVFbC5jaGlsZHJlbiwgbWVzc2FnZXMsIGVycm9ycyk7XG5cbiAgcmV0dXJuIChlcnJvcnMubGVuZ3RoID09IDApID9cbiAgICAgICAgICAgICBuZXcgWG1iRGVzZXJpYWxpemF0aW9uUmVzdWx0KG5vcm1hbGl6ZWRDb250ZW50LCBtZXNzYWdlcywgW10pIDpcbiAgICAgICAgICAgICBuZXcgWG1iRGVzZXJpYWxpemF0aW9uUmVzdWx0KG51bGwsIDx7W2tleTogc3RyaW5nXTogSHRtbEFzdFtdfT57fSwgZXJyb3JzKTtcbn1cblxuZnVuY3Rpb24gX2NoZWNrUm9vdEVsZW1lbnQobm9kZXM6IEh0bWxBc3RbXSk6IGJvb2xlYW4ge1xuICByZXR1cm4gbm9kZXMubGVuZ3RoIDwgMSB8fCAhKG5vZGVzWzBdIGluc3RhbmNlb2YgSHRtbEVsZW1lbnRBc3QpIHx8XG4gICAgICAgICAoPEh0bWxFbGVtZW50QXN0Pm5vZGVzWzBdKS5uYW1lICE9IF9CVU5ETEVfRUxFTUVOVDtcbn1cblxuZnVuY3Rpb24gX2NyZWF0ZU1lc3NhZ2VzKG5vZGVzOiBIdG1sQXN0W10sIG1lc3NhZ2VzOiB7W2tleTogc3RyaW5nXTogSHRtbEFzdFtdfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcnM6IFBhcnNlRXJyb3JbXSk6IHZvaWQge1xuICBub2Rlcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBIdG1sRWxlbWVudEFzdCkge1xuICAgICAgbGV0IG1zZyA9IDxIdG1sRWxlbWVudEFzdD5pdGVtO1xuXG4gICAgICBpZiAobXNnLm5hbWUgIT0gX01TR19FTEVNRU5UKSB7XG4gICAgICAgIGVycm9ycy5wdXNoKFxuICAgICAgICAgICAgbmV3IFhtYkRlc2VyaWFsaXphdGlvbkVycm9yKGl0ZW0uc291cmNlU3BhbiwgYFVuZXhwZWN0ZWQgZWxlbWVudCBcIiR7bXNnLm5hbWV9XCJgKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbGV0IGlkID0gX2lkKG1zZyk7XG4gICAgICBpZiAoaXNCbGFuayhpZCkpIHtcbiAgICAgICAgZXJyb3JzLnB1c2goXG4gICAgICAgICAgICBuZXcgWG1iRGVzZXJpYWxpemF0aW9uRXJyb3IoaXRlbS5zb3VyY2VTcGFuLCBgXCIke19JRF9BVFRSfVwiIGF0dHJpYnV0ZSBpcyBtaXNzaW5nYCkpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIG1lc3NhZ2VzW2lkXSA9IG1zZy5jaGlsZHJlbjtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBfaWQoZWw6IEh0bWxFbGVtZW50QXN0KTogc3RyaW5nIHtcbiAgbGV0IGlkcyA9IGVsLmF0dHJzLmZpbHRlcihhID0+IGEubmFtZSA9PSBfSURfQVRUUik7XG4gIHJldHVybiBpZHMubGVuZ3RoID4gMCA/IGlkc1swXS52YWx1ZSA6IG51bGw7XG59XG5cbmZ1bmN0aW9uIF9zZXJpYWxpemVNZXNzYWdlKG06IE1lc3NhZ2UpOiBzdHJpbmcge1xuICBsZXQgZGVzYyA9IGlzUHJlc2VudChtLmRlc2NyaXB0aW9uKSA/IGAgZGVzYz0nJHttLmRlc2NyaXB0aW9ufSdgIDogXCJcIjtcbiAgcmV0dXJuIGA8bXNnIGlkPScke2lkKG0pfScke2Rlc2N9PiR7bS5jb250ZW50fTwvbXNnPmA7XG59XG5cbmZ1bmN0aW9uIF9leHBhbmRQbGFjZWhvbGRlcihpbnB1dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIFJlZ0V4cFdyYXBwZXIucmVwbGFjZUFsbChfUExBQ0VIT0xERVJfUkVHRVhQLCBpbnB1dCwgKG1hdGNoKSA9PiB7XG4gICAgbGV0IG5hbWVXaXRoUXVvdGVzID0gbWF0Y2hbMl07XG4gICAgcmV0dXJuIGA8cGggbmFtZT0ke25hbWVXaXRoUXVvdGVzfT48L3BoPmA7XG4gIH0pO1xufVxuIl19