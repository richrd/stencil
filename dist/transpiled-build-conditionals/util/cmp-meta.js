"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function fillCmpMetaFromConstructor(cmp, cmpMeta) {
    if (!cmpMeta.tagNameMeta) {
        cmpMeta.tagNameMeta = cmp.is;
    }
    if (!cmpMeta.bundleIds) {
        cmpMeta.bundleIds = cmp.is;
    }
    cmpMeta.membersMeta = cmpMeta.membersMeta || {};
    if (!cmpMeta.membersMeta.color) {
        cmpMeta.membersMeta.color = {
            propType: 2 /* String */,
            attribName: 'color',
            memberType: 1 /* Prop */
        };
    }
    if (cmp.properties) {
        Object.keys(cmp.properties).forEach(function (memberName) {
            var property = cmp.properties[memberName];
            var memberMeta = cmpMeta.membersMeta[memberName] = {};
            if (property.state) {
                memberMeta.memberType = 16 /* State */;
            }
            else if (property.elementRef) {
                memberMeta.memberType = 64 /* Element */;
            }
            else if (property.method) {
                memberMeta.memberType = 32 /* Method */;
            }
            else if (property.connect) {
                memberMeta.memberType = 8 /* PropConnect */;
                memberMeta.ctrlId = property.connect;
            }
            else if (property.context) {
                memberMeta.memberType = 4 /* PropContext */;
                memberMeta.ctrlId = property.context;
            }
            else {
                if (property.type === String) {
                    memberMeta.propType = 2 /* String */;
                }
                else if (property.type === Boolean) {
                    memberMeta.propType = 4 /* Boolean */;
                }
                else if (property.type === Number) {
                    memberMeta.propType = 8 /* Number */;
                }
                else {
                    memberMeta.propType = 1 /* Any */;
                }
                if (property.attr) {
                    memberMeta.attribName = property.attr;
                }
                else {
                    memberMeta.attribName = memberName;
                }
                memberMeta.reflectToAttrib = !!property.reflectToAttr;
                if (property.mutable) {
                    memberMeta.memberType = 2 /* PropMutable */;
                }
                else {
                    memberMeta.memberType = 1 /* Prop */;
                }
            }
        });
    }
    if (cmp.listeners) {
        cmpMeta.listenersMeta = cmp.listeners.map(function (listener) {
            return {
                eventName: listener.name,
                eventMethodName: listener.method,
                eventCapture: listener.capture,
                eventDisabled: listener.disabled,
                eventPassive: listener.passive
            };
        });
    }
    return cmpMeta;
}
exports.fillCmpMetaFromConstructor = fillCmpMetaFromConstructor;
