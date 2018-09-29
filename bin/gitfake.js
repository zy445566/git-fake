const commander = require('commander');
const npmPackage =  require('../package.json');
const GitUserName = require('../index');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
class Command {
    constructor() {
        commander
        .version(npmPackage.version);
        this.unkown = true;
        this.userConfig = this.getUserConfig();
    }

    getListPath() {
        return path.join(__dirname,'list.json');
    }

    getUserConfig() {
        let isExists = fs.existsSync(this.getListPath());
        if (!isExists) {
            fs.writeFileSync(this.getListPath(),JSON.stringify({userList:[]}))
        }
        return JSON.parse(fs.readFileSync(this.getListPath()));
    }

    addList() {
        if (this.userConfig.userList.length>20) {
            this.userConfig.userList.splice(this.userConfig.userList.length-1,this.userConfig.userList.length-20);
        }
        fs.writeFileSync(this.getListPath(),JSON.stringify(this.userConfig));
    }

    now () {
        let userName  = GitUserName.getUserName();
        if (userName == undefined) {
            console.log(`this project not exist git user name`);
        } else {
            console.log(`gitId:${userName}`);
        }
        return userName;
    }

    insert () {
        let userName  = this.now();
        this.add(userName);
    }

    spliceUserList(userName) {
        if(!/^\w+$/.test(userName)) {
            GitUserName.error(`${userName} is not vailed!`);
        }
        let index = this.userConfig.userList.indexOf(userName);
        if (index>-1) {
            this.userConfig.userList.splice(index,1);
        }
    }

    add (gitId) {
        this.spliceUserList(gitId)
        this.userConfig.userList.unshift(gitId);
        this.addList();
        console.log(`Add '${gitId}' into list success!`)
    }

    use (gitId) {
        this.add(gitId);
        GitUserName.setUserName(gitId);
        console.log(`Use '${gitId}' as gitId success!`)
    }

    choose () {
        inquirer.prompt({
        type: 'list',
        name: 'theme',
        message: 'Who do you want to choose as your gitId?',
        choices: this.userConfig.userList
        })
        .then(answers => {
            this.use(answers.theme);
        });
    }

    getOptionFunc(optionName) {
        return (...args)=>{
            this.unkown = false;
            this[optionName](...args);
        }
    }

    unkownCommand () {
        return ()=>{
            if (this.unkown) {
                commander.help();
            }
        }
    }

    start() {
       commander
        .option('-n, --now', 'show now gitId',this.getOptionFunc('now'))
        .option('-i, --insert', 'show now gitId and add into list',this.getOptionFunc('insert'))
        .option('-a, --add <gitId>', 'Add gitId into list',this.getOptionFunc('add'))
        .option('-u, --use <gitId>', 'Use gitId and add into list',this.getOptionFunc('use'))
        .option('-c, --choose', 'Choose gitId from list',this.getOptionFunc('choose'))
        .on('command:*', this.unkownCommand())
        .parse(process.argv);
    }
}
new Command().start();