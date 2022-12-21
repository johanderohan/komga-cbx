'use strict';
var fetch = require('node-fetch');
var path = require('path');

exports.tasks = async function (req, res) {

  let komga = process.env.KOMGA || 'http://localhost:8080'
  let username = process.env.USERNAME;
  let password = process.env.PASSWORD;


  let response = await fetch(komga +'/api/v1/books?page=0&size=20&sort=media.status%2Casc&media_status=ERROR&media_status=UNSUPPORTED', {
    method:'GET',
    headers: {'Authorization': 'Basic ' + btoa(username+':'+password)}
  });

  let data = await response.json();

  var libraries = [];

  for (var i = 0; i < data.content.length; i++) {
    console.log('Processing: 'data.content[i].url);
    var correctedPath = path.resolve(data.content[i].url);
    var newPath = correctedPath.substr(0, correctedPath.lastIndexOf(".")) + ".cbz";

    let infoD = await spawnChildDecompress(correctedPath, '-o/temp/'+data.content[i].id);
    console.log(infoD);
    let infoC = await spawnChildCompress(newPath, '/temp/'+data.content[i].id);
    console.log(infoC);
    let infoM = await spawnChildMove(correctedPath);
    console.log(infoM);

    libraries.push(data.content[i].libraryId);
    await sleep(10000);
  }

  let uniques = libraries.filter((x, i) => i === libraries.indexOf(x))

  for (var i = 0; i < uniques.length; i++) {
    let responseA = await fetch(komga +'/api/v1/libraries/'+libraries[i]+'/scan', {
      method:'POST',
      headers: {'Authorization': 'Basic ' + btoa(username+':'+password)}
    });

    let dataA = await responseA.text();

    console.log('Refreshing: '+data.content[i].seriesId);
  }

  await sleep(300000); /*wait 5m to a library refresh before recheck rar5 files */
  global.RUN = false;

};


async function spawnChildCompress(path, temp) {
    const { spawn } = require('child_process');
    const child = spawn('zip', ["-r", "-j", path, temp]);

    let data = "";
    for await (const chunk of child.stdout) {
        console.log('stdout chunk: '+chunk);
        data += chunk;
    }
    let error = "";
    for await (const chunk of child.stderr) {
        console.error('stderr chunk: '+chunk);
        error += chunk;
    }
    const exitCode = await new Promise( (resolve, reject) => {
        child.on('close', resolve);
    });

    if( exitCode) {
        throw new Error( `subprocess error exit ${exitCode}, ${error}`);
    }
    return data;
}

async function spawnChildDecompress(path, temp) {
    const { spawn } = require('child_process');
    const child = spawn('7z', ["e", path, temp, "-y"]);

    let data = "";
    for await (const chunk of child.stdout) {
        console.log('stdout chunk: '+chunk);
        data += chunk;
    }
    let error = "";
    for await (const chunk of child.stderr) {
        console.error('stderr chunk: '+chunk);
        error += chunk;
    }
    const exitCode = await new Promise( (resolve, reject) => {
        child.on('close', resolve);
    });

    if( exitCode) {
        throw new Error( `subprocess error exit ${exitCode}, ${error}`);
    }
    return data;
}

async function spawnChildMove(path) {
    const { spawn } = require('child_process');
    const child = spawn('mv', [path, process.env.BACKUP]);

    let data = "";
    for await (const chunk of child.stdout) {
        console.log('stdout chunk: '+chunk);
        data += chunk;
    }
    let error = "";
    for await (const chunk of child.stderr) {
        console.error('stderr chunk: '+chunk);
        error += chunk;
    }
    const exitCode = await new Promise( (resolve, reject) => {
        child.on('close', resolve);
    });

    if( exitCode) {
        throw new Error( `subprocess error exit ${exitCode}, ${error}`);
    }
    return data;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
