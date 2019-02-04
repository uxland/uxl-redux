/*const fs = require('fs');
const walk = function(dir) {
    let results = [];
    let list = fs.readdirSync(dir);
    list.forEach(file =>{
        const path = `${dir}/${file}`
        if(file){
            let stat = fs.statSync(path);
            if(stat && stat.isDirectory()){
                results = results.concat(walk(path));
            }else results.push(path);
        }
    });
    return results;
};
let files = walk(__dirname);
files.forEach(require);*/
//files.forEach(fileName => require(fileName));
//import './action-name-builder.fixture';