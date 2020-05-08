#!/usr/bin/env node
const funciones = require('./utils/funciones.js')
const minimist = require('minimist');
//const lineReader = require('line-reader');
const fs = require("fs");
const path = require('path');

let filePath=path.normalize(process.cwd());
var options = {
    n:false,
    e:false,
    i:false,
    f:false
};

var subs = {
    n:[],
    e:[],
    i:[],
    f:[],
    cm:[]
}

const args = minimist(process.argv.slice(2));
const num_arg = args._.length;
console.log(' | -------------------------------------------------- | \n');

var arrayAux=funciones.setData(args.n);
options.n=arrayAux[0];
if (options.n!==false){
        subs.n=[funciones.formatSubst(arrayAux[1])];
}

arrayAux=funciones.setData(args.e);
options.e=arrayAux[0];
if (options.e!==false){
    if (arrayAux[1].length>1){
        subs.e=funciones.formatSubst(arrayAux[1]);
        //subs.concat(funciones.formatSubst(arrayAux[1]));
    }else {
        subs.e=[funciones.formatSubst(arrayAux[1])];
    }
}

arrayAux=funciones.setData(args.i);
options.i=arrayAux[0];
if (options.i!==false){
        subs.i = [funciones.formatSubst(arrayAux[1])];
}

// bobtenemos f
arrayAux=funciones.setData(args.f);
options.f=arrayAux[0];

if (num_arg===1 && ( options.n===true || options.e===true || options.i===true || options.f===true) ){
    fileName=args._[0];
}else if(num_arg===2){
    fileName=args._[1];
    subs.cm=funciones.formatSubst(args._[0]);
}else {
    throw new Error('No se introdujo comando de substitución valido \n '+'Formato: edithor OPTIONS [SUBSTITUTION COMMAND] [INPUTFILE]')
}

const fileAddress=funciones.getFileAddress(process.cwd(),fileName);

var letsgo=false;
if (fs.existsSync(fileAddress)) { letsgo=true; }
else {
    throw new Error('El archivo con el nombre '+ fileName+' no ha sido encontrado en el directorio '+filePath)
}

var arrayF=[];
if (options.f!==false){
    var scriptFile=funciones.getFileAddress(process.cwd(),arrayAux[1]);
    if (!fs.existsSync(scriptFile)) {
        throw new Error('No se encontró el script correspondiente a: '+scriptFile)
    }
    var lineReaderF = require('readline').createInterface({
        input: require('fs').createReadStream(scriptFile)
    });

    lineReaderF.on('line', function (line) {
        subs.f.push(funciones.formatSubst(line));
    });

    lineReaderF.on('close', function (line) {

        if (letsgo===true && num_arg===1){
            funciones.runEditor(fileAddress,subs,options);
        }else if(letsgo===true && num_arg===2) {
            funciones.runEditorByOne(fileAddress,subs,options);
        }
    });
}else {
    if (letsgo===true && num_arg===1){
        funciones.runEditor(fileAddress,subs,options);
    }else if(letsgo===true && num_arg===2) {
        funciones.runEditorByOne(fileAddress,subs,options);
    }
}




//console.log(subs);
//console.log(funciones.setData(args.f));
/*
console.log('-n: '+funciones.setData(args.n));
console.log('-e: '+funciones.setData(args.e));
console.log('-f: '+funciones.setData(args.f));
console.log('-i: '+funciones.setData(args.i));*/