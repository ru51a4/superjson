class superJSON {

    static parse(str) {
        str = str.split("");
        //
        let queue = [];
        let obj;
        let stackObjs = [];
        let i = 0;
        ///
        let iForNext = 0;

        let lex = () => {
            let utils = {
                next(j, reset = false) {
                    let k = 1;
                    if (reset) {
                        iForNext = j;
                    }
                    for (let j = iForNext; j <= str.length - 1; j++) {
                        if (str[j] === ' ') {

                        } else {
                            while (str[j + k] === ' ' || str[j + k] === "\n" || str[j + k] === "\t") {
                                k++;
                            }
                            iForNext = j + k;
                            return str[j];
                        }
                    }
                },
                isValidChar(char) {
                    let invalidChar = ["\n", "\t", "    "];
                    return !invalidChar.includes(char);
                }
            }
            let t = '';
            let isString = false;
            for (let j = i; j <= str.length - 1; j++) {
                if (str[j] === '"') {
                    isString = !isString;
                } else {
                    if (isString || str[j] !== ' ') {
                        t += str[j];
                    }
                    t = t.split("").filter((item) => utils.isValidChar(item)).join("");
                }
                if (!isString) {
                    if (utils.next(j + 1, true) === ':' && utils.next() === "{") {
                        queue.push({
                            item: t,
                            type: 'open'
                        });
                        t = '';
                        j = iForNext;
                        i = j;
                    } else if (utils.next(j + 1, true) === '{') {
                        queue.push({
                            item: utils.next(j + 1, true),
                            type: 'openObj'
                        });
                        t = '';
                        j = iForNext;
                        i = j;
                    } else if (utils.next(j + 1, true) === ':' && utils.next() === "[") {
                        queue.push({
                            item: t,
                            type: 'openArray'
                        });
                        t = '';
                        j = iForNext;
                        i = j;
                    }
                    else if ((utils.next(j + 1, true) === ',' || utils.next(j + 1, true) === '}' || utils.next(j + 1, true) === ']')) {
                        //todo
                        if (t !== '' && (t !== '}') && t !== ']' && t !== ',' ) {
                            //todo
                            queue.push({
                                item: t,
                                type: t.includes(":") ? 'value' : 'primitive'
                            });
                        }
                        //todo
                        let jj = iForNext - 1;
                        if (utils.next(j + 1, true) === '}' || utils.next(j + 1, true) === ']') {
                            queue.push({
                                item: utils.next(j + 1, true),
                                type: 'closed'
                            });
                            if (utils.next() === ',') {
                                jj = iForNext;
                            }
                        }
                        t = '';
                        j = jj;
                        i = j;
                    }
                    }
                //
                if (queue.length) {
                    break;
                }
            }
        }
        /////

        //main
        let item = str.shift()

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
            if (item.type === 'open' || item.type === 'openObj') {
                let tObj = stackObjs[stackObjs.length - 1];
                if (!Array.isArray(tObj)) {
                    console.log(item.item);
                    tObj[item.item] = {};
                    stackObjs.push(tObj[item.item]);
                } else {
                    let itemObject = {};
                    tObj.push(itemObject);
                    stackObjs.push(itemObject);
                }
            } else if (item.type === 'value') {
                let tObj = stackObjs[stackObjs.length - 1];
                let cValue = item.item.split(":");
                let key = cValue[0];
                let value = cValue[1];
                tObj[key] = value;
            } else if (item.type === 'closed') {
                stackObjs.pop();
            } else if (item.type === 'openArray') {
                let tObj = stackObjs[stackObjs.length - 1];
                let key = item.item
                tObj[key] = [];
                stackObjs.push(tObj[key]);
            } else if (item.type === 'primitive'){
                let tObj = stackObjs[stackObjs.length - 1];
                tObj.push(item.item);
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
                    if (superJSON.utils.isPrimitive(obj[key])) {
                        json += `"${key}":${obj[key]}`;
                    } else {
                        json += `"${key}":"${obj[key]}"`;
                    }
                    json += (!isLast) ? ',' : '';
                }
            }
        }
    }
}