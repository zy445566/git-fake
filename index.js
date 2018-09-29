const path = require('path');
const fs = require('fs');
const ini = require('ini');
module.exports = class GitEmail {
    static getConfigPath() {
        return path.join(process.cwd(),'.git/config')
    }

    static error(msg){
        console.error(msg);process.exit();
    }

    static existsConfigPath() {
        if(!fs.existsSync(GitEmail.getConfigPath())) {
            GitEmail.error('this dir not exist .git/config file');
        }
    }

    static getConfig() {
        GitEmail.existsConfigPath();
        return ini.parse(fs.readFileSync(GitEmail.getConfigPath(),'utf-8'));
    }

    static getUserEmail () {
        let config = GitEmail.getConfig();
        if (config.user && config.user.email){return config.user.email;}
    }

    static setUserEmail (userEmail) {
        let config = GitEmail.getConfig();
        if (!config.user){config.user ={}}
        config.user.email = userEmail;
        fs.writeFileSync(GitEmail.getConfigPath(),ini.stringify(config));
    }
}
