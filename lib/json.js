class superJSON {

    static parse(str) {
        str = str.split("");
        //
        let queue = [];
        let obj;
        let stackObjs = [];
        let t = '';
        let cChar = '';
        let isString = false;
        let next = () => {
            while (str.length) {
                let t = str.shift();
                if (isString) {
                    return t;
                }
                if (t !== ' ' && t !== '\n' && t !== "\t") {
                    return t;
                }
            }
        }
        let getNextChar = (i, value, check = false) => {
            let counter = 0;
            while (!(i > str.length - 1)) {
                if (str[i] !== " " && str[i] !== '\n' && str[i] !== "\t") {
                    if (str[i] === value) {
                        for (let k = 0; k <= counter; k++) {
                            if (!check) {
                                str.shift();
                            }
                        }
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    i++;
                    counter++;
                }
            }
        }
        let lex = () => {
            let dataType = "string";
            let isComma = false;
            let valueKey = '';
            while (str.length) {
                cChar = next();
                if (cChar == "\"") {
                    isString = !isString;
                }
                if (!isString && cChar === ":" && (!getNextChar(0, "{", true) && !getNextChar(0, "[", true))) {
                    isComma = true;
                    valueKey = t;
                    t = '';
                    continue;
                }
                if (!isString) {
                    switch (cChar) {
                        case "n":
                            dataType = "null";
                            next();
                            next();
                            next();
                            continue;
                            break;
                        case "t":
                            dataType = "true";
                            next();
                            next();
                            next();
                            continue;
                            break;
                        case "f":
                            dataType = "false";
                            next();
                            next();
                            next();
                            next();
                            continue;
                            break;
                        case "1":
                        case "2":
                        case "3":
                        case "4":
                        case "5":
                        case "6":
                        case "7":
                        case "8":
                        case "9":
                        case "0":
                            dataType = "number";
                            break;
                        case "\"":
                            dataType = "string"
                            break;
                    }
                }
                if (cChar === "{") {
                    queue.push({
                        value: t,
                        type: 'openObj'
                    });
                } else if (cChar == ":" && getNextChar(0, "{")) {
                    queue.push({
                        value: t,
                        type: 'open'
                    });

                } else if (cChar == ":" && getNextChar(0, "[")) {
                    queue.push({
                        value: t,
                        type: 'openArray'
                    });
                } else if (cChar == "[") {
                    queue.push({
                        value: t,
                        type: 'openArrayPrimitive'
                    });
                } else if (!isString && (cChar == "," || cChar == "}" || cChar == "]")) {
                    if (t.length || isComma || dataType === "null" || dataType === "true" || dataType === "false") {
                        if (isComma) {
                            queue.push({
                                valueKey: valueKey,
                                value: t,
                                type: 'value',
                                dataType: dataType
                            });
                            isComma = false;
                            valueKey = '';
                        } else {
                            queue.push({
                                value: t,
                                type: 'primitive',
                                dataType: dataType
                            });
                        }
                    }
                    if ((cChar == "}" || cChar == "]")) {
                        queue.push({
                            value: cChar,
                            type: 'closed'
                        });
                    }
                } else {
                    if (cChar !== "\"") {
                        t += cChar;
                    }
                }
                if (queue.length) {
                    t = '';
                    break;
                }
            }
        }
        let toDataType = (value, dataType) => {
            let res;
            switch (dataType) {
                case "string":
                    res = value;
                    break;
                case "null":
                    res = null;
                    break;
                case "false":
                    res = false;
                    break;
                case "true":
                    res = true;
                    break;
                case "number":
                    res = Number(value);
                    break;
            }
            return res;
        }
        //main
        let item = next()

        if (item === "[") {
            obj = [];
            stackObjs.push(obj);
        }
        if (item === '{') {
            obj = {};
            stackObjs.push(obj);
        }

        lex();
        while (queue.length) {
            let item = queue.shift();
            //build
            if (item.type === 'open') {
                let tObj = stackObjs[stackObjs.length - 1];
                tObj[item.value] = {};
                stackObjs.push(tObj[item.value]);
            } else if (item.type === 'openObj') {
                let tObj = stackObjs[stackObjs.length - 1];
                let itemObject = {};
                tObj.push(itemObject);
                stackObjs.push(itemObject);
            } else if (item.type === 'value') {
                let tObj = stackObjs[stackObjs.length - 1];
                tObj[item.valueKey] = toDataType(item.value, item.dataType);
            } else if (item.type === 'openArray') {
                let tObj = stackObjs[stackObjs.length - 1];
                let key = item.value
                tObj[key] = [];
                stackObjs.push(tObj[key]);
            } else if (item.type === 'openArrayPrimitive') {
                let tObj = stackObjs[stackObjs.length - 1];
                let t = [];
                tObj.push(t);
                stackObjs.push(t);
            } else if (item.type === 'primitive') {
                let tObj = stackObjs[stackObjs.length - 1];
                item.value = toDataType(item.value, item.dataType);
                tObj.push(item.value);
            } else if (item.type === 'closed') {
                stackObjs.pop();
            }
            ///
            lex();
        }
        return obj;
    }

    static stringify(obj) {
        let res = '';
        let deep = (obj) => {
            if (obj == null) {
                res += "null";
                return;
            }
            if (Array.isArray(obj)) {
                res += "[";
            } else {
                res += "{";
            }
            let objectLength = obj.length;
            if(!Array.isArray(obj)){
                objectLength = Object.entries(obj).length;
            }
            let i = 0;
            for (let key in obj) {
                let item = obj[key];
                i++;
                if ((/boolean|number|string/).test(typeof item)) {
                    if (!Array.isArray(obj)) {
                        res += '"' + key + '"' + ':';
                    }
                    if ((/string/).test(typeof item)) {
                        res += '"' + item + '"';
                    } else {
                        res += item;
                    }
                    if (i !== objectLength) {
                        res += ",";
                    }
                } else {
                    if (!Array.isArray(obj)) {
                        res += '"' + key + '"' + ':';
                    }
                    deep(item);
                    if (i !== objectLength) {
                        res += ",";
                    }
                }
            }
            if (Array.isArray(obj)) {
                res += "]";
            } else {
                res += "}";
            }
        }
        deep(obj);
        return res;
    }
}

module.exports = superJSON