//modulos externos
import inquirer from "inquirer"
import chalk from "chalk"

//modulos internos
import fs from 'fs'

operation()

function operation() {
    inquirer.prompt([{
        type: "list",
        name: "action",
        message: "O que você dejesa fazer?",
        choices: [
            'Criar conta',
            'Consultar saldo',
            'Depositar',
            'Sacar',
            'Sair'
        ],
    },
    ]).then((answer) => {
        const action = answer['action']

        if(action === 'Criar conta') {
            createAccount()
        } else if(action === "Consultar saldo"){
            getAccountBalance()
        } else if(action === "Depositar"){
            deposit()
        } else if (action === "Sacar") {
            withdraw()
        } else if (action === "Sair"){
            console.log(chalk.bgBlue.black("Obrigrado por usar o Account"))
            process.exit()
        }
    })
    .catch((err) => console.log(err))
}

//criar conta
function createAccount() {
    console.log(chalk.bgGreen.black('Parabéns por escolher nosso banco!'))
    console.log(chalk.green('Defina as opções da sua conta a segiur'))

    buildAccount()
}

function buildAccount() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite um nome para a sua conta: '
        },
    ]).then((answer) => {
        const accountName = answer['accountName']

        console.info(accountName)

        if(!fs.existsSync('account')) {
            fs.mkdirSync('account')
        }

        if (fs.existsSync(`account/${accountName}.json`)){
            console.log(chalk.bgRed.black("Esta conta já existe"))

            buildAccount()
            return
        }

        fs.writeFileSync(`account/${accountName}.json`, JSON.stringify({ balance: 0 }))

        console.log(chalk.green("Parabéns, a sua conta foi criada"))
        operation()
    })
    .catch((err) => console.log(err))
}

// add montante para a conta do usuário
function deposit() {
    inquirer.prompt([
        {
            name: "accountName",
            message: "Qual é o nome da sua conta?"
        }
    ])
    .then((answer) => {
        const accountName = answer['accountName']

        //verificar se a conta existe
        if(!checkAccount(accountName)) {
            return deposit()
        }

        inquirer.prompt([
            {
                name: "amount",
                message: "Quanto deseja depositar?",
            },
        ])
        .then((answer) => {
            const amount = answer['amount']
            //Adicionar montante
            addAmount(accountName, amount)
            operation()
        })
        .catch((err) => console.log(err))
    })
    .catch((err) => console.log(err))
}

function checkAccount(accountName) {
    if(!fs.existsSync(`account/${accountName}.json`)){
        console.log(chalk.bgRed.black("Essa conta não existe, tente novamente!"))
        return false
    }
    return true
}

function addAmount(accountName, amount) {
    const accountData = getAcount(accountName)

    if(!amount) {
        console.log(chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde!"))
        return deposit()
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

    fs.writeFileSync(`account/${accountName}.json`,
        JSON.stringify(accountData),
        function(err) {
            console.log(err)
        })

    console.log(chalk.green(`Foi depositado o valor de R$${amount} na sua conta`))
}

function getAcount (accountName) {
    const accountJSON = fs.readFileSync(`account/${accountName}.json`, {
        encoding: "utf8",
        flag: 'r'
    })

    return JSON.parse(accountJSON)
}

//Consultar o saldo da conta
function getAccountBalance() {
    inquirer.prompt([
        {
            name: "accountName",
            message: "Qual é o nome da sua conta?",
        }
    ])
    .then((answer) => {
        const accountName = answer['accountName']

        //verificar se a conta existe
        if(!checkAccount(accountName)) {
            return getAccountBalance()
        }

        const  accountData = getAcount(accountName)

        console.log(chalk.bgBlue.black(`O valor de sua conta é de R$${accountData.balance}`))
        operation()
    })
    .catch((err) => console.log(err))
}

// sacar o valor da conta
function withdraw() {
    inquirer.prompt([
        {
            name: "accountName",
            message: "Qual é o nome da sua conta?"
        }
    ])
    .then((answer) => {
        const accountName = answer['accountName']

        if (!checkAccount(accountName)) {
            return withdraw()
        }

        inquirer.prompt([
            {
                name: "amount",
                message: "Quanto você deseja sacar?"
            }
        ])
        .then((answer) => {
            const amount = answer['amount']
        
            removeAmount(accountName, amount)
        })
        .catch((err) => console.log(err))
    })
    .catch((err) => console.log(err))
}

function removeAmount(accountName, amount) {
    const  accountData = getAcount(accountName)

    if(!amount) {
        console.log(chalk.bgRed.black("Ocorreu um erro, tente novamente!"))
        return withdraw()
    }

    if(amount > accountData.balance || amount < 0) {
        console.log(chalk.bgRed.black("Impossivel sacar essa quantia"))
        return withdraw()
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

    fs.writeFileSync(
        `account/${accountName}.json`,
        JSON.stringify(accountData),
        function(err) {
            console.log(err)
        }
    )

    console.log(chalk.green(`Foi realizado um saque de R$${amount} da sua coonta!`))
    operation()
}