class superJSON {

    static parse(str) {
        str = str.split("");
        //
        let queue = [];
        let obj;
        let stackObjs = [];
        let tChar = '';
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
        let getNextChar = (i, value) => {
            let counter = 0;
            while (!(i > str.length - 1)) {
                if (str[i] !== " " && str[i] !== '\n' && str[i] !== "\t") {
                    if (str[i] === value) {
                        for (let k = 0; k <= counter; k++) {
                            str.shift();
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
            while (str.length) {
                cChar = next();
                if (cChar == "\"") {
                    isString = !isString;
                }
                switch (cChar) {
                    case "n":
                        dataType = "null";
                        break;
                    case "t":
                        dataType = "true";
                        break;
                    case "f":
                        dataType = "false";
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
                if (cChar === "{") {
                    queue.push({
                        value: tChar,
                        type: 'openObj'
                    });
                } else if (cChar == ":" && getNextChar(0, "{")) {
                    queue.push({
                        value: tChar,
                        type: 'open'
                    });

                } else if (cChar == ":" && getNextChar(0, "[")) {
                    queue.push({
                        value: tChar,
                        type: 'openArray'
                    });
                } else if (cChar == "[") {
                    queue.push({
                        value: tChar,
                        type: 'openArrayPrimitive'
                    });
                } else if (!isString && (cChar == "," || cChar == "}" || cChar == "]")) {
                    if (tChar.length) {
                        queue.push({
                            value: tChar,
                            type: tChar.includes(":") ? 'value' : 'primitive',
                            dataType: dataType
                        });
                    }
                    if ((cChar == "}" || cChar == "]")) {
                        queue.push({
                            value: cChar,
                            type: 'closed'
                        });
                    }
                } else {
                    if (cChar !== "\"") {
                        tChar += cChar;
                    }
                }
                if (queue.length) {
                    tChar = '';
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
                let cValue = item.value.split(":");
                let key = cValue[0];
                let value = cValue[1];
                tObj[key] = toDataType(value, item.dataType);
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

    static stringify(object) {
        let json = (Array.isArray(object)) ? '[' : '{';
        stringifyHelper(object);
        json += (Array.isArray(object)) ? ']' : '}';
        return json;

        function stringifyHelper(obj) {
            let keys;
            if (!(obj !== Object(obj))) {
                keys = Object.keys(obj);
            } else {
                json += `"${obj}"`;
                return;
            }
            for (let key of keys) {
                const isLast = key === keys[keys.length - 1];
                if (Array.isArray(obj[key])) {
                    json += `"${key}":[`;
                    for (let val of obj[key]) {
                        const isLastValArray = val === obj[key][obj[key].length - 1];
                        if (val instanceof Object) {
                            json += '{';
                        }
                        stringifyHelper(val);
                        if (val instanceof Object) {
                            json += '}';
                        }
                        json += (!isLastValArray) ? ',' : '';
                    }
                    json += (!isLast) ? '],' : ']';
                } else if (obj[key] instanceof Object) {
                    json += `"${key}":{`;
                    stringifyHelper(obj[key]);
                    json += '}';
                    json += (!isLast) ? ',' : '';
                } else {
                    json += `"${key}":"${obj[key]}"`;
                    json += (!isLast) ? ',' : '';
                }
            }
        }
    }
}