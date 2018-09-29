#!/usr/bin/env node
const commander = require('commander');
const npmPackage =  require('../package.json');
const GitEmail = require('../index');
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
            fs.writeFileSync(this.getListPath(),JSON.stringify({userEmailList:[]}))
        }
        return JSON.parse(fs.readFileSync(this.getListPath()));
    }

    addList() {
        if (this.userConfig.userEmailList.length>20) {
            this.userConfig.userEmailList.splice(this.userConfig.userEmailList.length-1,this.userConfig.userEmailList.length-20);
        }
        fs.writeFileSync(this.getListPath(),JSON.stringify(this.userConfig));
    }

    now () {
        let userEmail  = GitEmail.getUserEmail();
        if (userEmail == undefined) {
            GitEmail.error(`this project not exist git user email,maybe need try --use or --choose.`);
        } else {
            console.log(`gitEmail:${userEmail}`);
        }
        return userEmail;
    }

    insert () {
        let userEmail  = this.now();
        this.add(userEmail);
    }

    spliceUserEmailList(userEmail) {
        if(!/^[a-zA-Z\d_.-]+@[a-zA-Z\d-]+(\.[a-zA-Z\d-]+)*\.[a-zA-Z\d]{2,6}$/.test(userEmail)) {
            GitEmail.error(`${userEmail} is not vailed email!`);
        }
        let index = this.userConfig.userEmailList.indexOf(userEmail);
        if (index>-1) {
            this.userConfig.userEmailList.splice(index,1);
        }
    }

    add (gitEmail) {
        this.spliceUserEmailList(gitEmail)
        this.userConfig.userEmailList.unshift(gitEmail);
        this.addList();
        console.log(`Add '${gitEmail}' into list success!`)
    }

    use (gitEmail) {
        this.add(gitEmail);
        GitEmail.setUserEmail(gitEmail);
        console.log(`Use '${gitEmail}' as gitEmail success!`)
    }

    choose () {
        if (this.userConfig.userEmailList.length<=0) {
            GitEmail.error(`Not have vailed email!Maybe need try --use or --insert`);
        }
        inquirer.prompt({
        type: 'list',
        name: 'theme',
        message: 'Who do you want to choose as your gitEmail?',
        choices: this.userConfig.userEmailList
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
        .option('-n, --now', 'show now gitEmail',this.getOptionFunc('now'))
        .option('-i, --insert', 'show now gitEmail and add into list',this.getOptionFunc('insert'))
        .option('-a, --add <gitEmail>', 'Add gitEmail into list',this.getOptionFunc('add'))
        .option('-u, --use <gitEmail>', 'Use gitEmail and add into list',this.getOptionFunc('use'))
        .option('-c, --choose', 'Choose gitEmail from list',this.getOptionFunc('choose'))
        .on('command:*', this.unkownCommand())
        .parse(process.argv);
    }
}
new Command().start();