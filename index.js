const childProcess = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');
const ini = require('ini');
module.exports = class GitUserName {
    static getConfigPath() {
        return path.join(__dirname,'.git/config')
    }

    static error(msg){
        console.error(msg);process.exit();
    }

    static existsConfigPath() {
        if(!fs.existsSync(GitUserName.getConfigPath())) {
            GitUserName.error('this dir not exist .git/config file');
        }
    }

    static getConfig() {
        GitUserName.existsConfigPath();
        return ini.parse(fs.readFileSync(GitUserName.getConfigPath(),'utf-8'));
    }

    static getUserName () {
        let config = GitUserName.getConfig();
        if (config.user && config.user.name){return config.user.name;}
    }

    static setUserName (userName) {
        let config = GitUserName.getConfig();
        if (!config.user){config.user ={}}
        config.user.name = userName;
        fs.writeFileSync(GitUserName.getConfigPath(),ini.stringify(config));
    }
}
