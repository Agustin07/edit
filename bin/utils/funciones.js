const path = require('path');
const fs = require("fs");

function setData(input) {
    if (typeof input !== 'undefined') {
        if (input===true){ // ha sido llamada una opcion.
            return [true];
        }
        if (input!==true){  //la opcion es llamada y puede contener un comando de substitucion
            return [true,input];
        }
        else if(Array.isArray(input)){ //la opcion es llamada y puede contener varios comandos de substitucion
            return [true].concat(input);
        }
        else {
            return [false]; // opcion no llamada
        }
    }
    else {
        return [false]; // opcion no llamada
    }
}

function formatear(cadena) {  // formato de comandos esperado: 's/regexp/var_substituta/flag'
    let config=cadena.split('/');
    if (config[0]==='s'){  //Valida el comando de substitucion.
        if (config.length!==4 ){
            throw new Error('Comando "'+cadena+'" no valido')
        }
        else {
            if (config[3]==='g' || config[3]==='' || config[3].match('^w.*$') || config[3]==='p' || config[3]==='I'){
                if (config[3]==='g'){
                    return [new RegExp(config[1],'g'),config[2],config[3]];
                } else if(config[3]==='I'){
                    return [new RegExp(config[1],'i'),config[2],config[3]];
                } else if(config[3].match('^w.*$')){
                    var wConfig=config[3].split(' '); //formato cuando flag=w [ expreg ,var_substituta, flag, NameOfFileToWrite]
                    return [new RegExp(config[1]),config[2],wConfig[0],wConfig[1]];
                } else {
                    return [new RegExp(config[1]),config[2],config[3]];  //formato [ expreg ,var_substituta, flag]
                }
            }else {
                throw new Error('Comando de substitución no valido');
            }
        }
    }else {
        throw new Error('Comando de substitución "'+cadena+'" no valido');
    }
}

function formatSubst(comando) {
    if (comando!==undefined){
        if (Array.isArray(comando)){ //Es un conjunto de comandos?
            var arreglocomando=[];
            for (var i = 0, len = comando.length; i < len; i++) {
                arreglocomando[i]=formatear(comando[i]);
            }
            return arreglocomando; //retorna arreglo de comandos formateados.
        }else {
            return formatear(comando);  //retorna un comando formateado.
        }

    }
    return null;
}

function getFileAddress(dirname,fileName){
    var fName=path.normalize(fileName);
    return path.join(dirname,fileName);
}

function runEditor(fileAddress, subs,options) {
    var lineReader = require('readline').createInterface({
        input: require('fs').createReadStream(fileAddress)
    });
    var bitacora=[].concat(subs.cm,subs.n,subs.e,subs.i,subs.f);
    var writeForW=[];
    var iupdate='';

    bitacora=bitacora.filter(n => n);
    //console.log(bitacora.filter(n => n));

    for (var i = 0, len = bitacora.length; i < len; i++) {
        if(bitacora[i][2]=='w'){
            writeForW[i]=fs.createWriteStream(bitacora[i][3]+'.txt');
        }
    }


    lineReader.on('line', function (line) {
        for (var i = 0, len = bitacora.length; i < len; i++) {
            if (bitacora[i][0].test(line)){
                line=line.replace(bitacora[i][0],bitacora[i][1]);
                if (bitacora[i][2]==='p'){
                    console.log(line);
                }
                if (bitacora[i][2]==='w'){
                    writeForW[i].write(line + '\n');
                }
            }
            if (options.i===true){
                iupdate+=line+'\n';
            }
        }
        if (options.n===false){ console.log(line)}
    });

    lineReader.on('close', function (line) {
        if(options.i===true){
            var fileUpdate=fs.createWriteStream(fileAddress);
            fileUpdate.write(iupdate);
        }
    });


}


function runEditorByOne(fileAddress, subs,options) {
    var lineReader = require('readline').createInterface({
        input: require('fs').createReadStream(fileAddress)
    });

    var bitacora=[].concat(subs.cm);
    var writeForW=[];

    if(bitacora[2]=='w'){
        writeForW=fs.createWriteStream(bitacora[3]+'.txt');
    }

    lineReader.on('line', function (line) {
            if (bitacora[0].test(line)){
                line=line.replace(bitacora[0],bitacora[1]);
                if (bitacora[2]==='p'){   console.log(line);   }
                if (bitacora[2]==='w'){   writeForW.write(line + '\n');  }
            }
            // if (options.i===true){ iupdate+=line+'\n'; }
        if (options.n===false){ console.log(line) }
    });
    /* lineReader.on('close', function (line) {
        if(options.i===true){ var fileUpdate=fs.createWriteStream(fileAddress); fileUpdate.write(iupdate); }
    }); */
}

exports.setData = setData;
exports.formatSubst =formatSubst;
exports.formatear =formatear;
exports.getFileAddress =getFileAddress;
exports.runEditor =runEditor;
exports.runEditorByOne =runEditorByOne;
