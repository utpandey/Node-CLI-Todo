
var countCompleted = 0;
var countPending = 0;
const chalk = require('chalk')
const rl = require('readline');
const prompts = require('prompts');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)
// Set some defaults (required if your JSON file is empty)
db.defaults({ todos: [] ,todoCount : 0}).write()


const args = process.argv

let usage = `Usage :-
$ ./todo add "todo item"  # Add a new todo
$ ./todo ls               # Show remaining todos
$ ./todo del NUMBER       # Delete a todo
$ ./todo done NUMBER      # Complete a todo
$ ./todo help             # Show usage
$ ./todo report           # Statistics`;



// usage represents the help guide
const usageFunction = function() {
  console.log(usage)
}

// used to log errors to the console in red color
function errorLog(error) {
  const eLog = chalk.red(error)
  console.log(eLog)
}

function newTodo() {
  if(!args[3]) {
    errorLog("Error: Missing todo string. Nothing added!")
    return
  }
  let n = args[3]
  let todosLength = db.get('todos').value().length
  db.get('todos').push({
    id: todosLength++,
    title: n,
    complete: false,
  }).write();
  console.log(`Added todo: "${n}"`);
  db.update('todoCount', n => n + 1)
  .write()
  return
}

function getTodos() {
  const todos = db.get('todos').value()
  let index = todos.length;
  console.log(index)
  console.log(todos.length)
  if(todos.length < 1) {
    errorLog("There are no pending todos!")
    return
  }
  todos.slice().reverse().forEach(todo => {
    let todoText = `[${todo.id}] ${todo.title}`
    console.log(chalk.strikethrough(todoText))
  })
  return
}

function reportTodo(){
  const todos = db.get('todos').value()
  let cal = new Date(Date.now()).toLocaleString().split(',')[0]
  todos.forEach(todo => {
    if (!todo.complete) {
      countPending++;
    }
  })
  const countComplete = db.get('todoCount').value()
  // console.log(`${cal} Pending : ${countPending} Completed : ${countComplete - countPending}`)
  let date = new Date();
  let expected = `${date.toISOString().slice(0, 10)} Pending : ${countPending} Completed : ${countComplete - countPending}`;
  return
}

async function deleteTodo(){
  let n = Number(args[3])
  let todosLength = db.get('todos').value().length
  if (n == 0 || n > todosLength) {
    errorLog(`Error: todo #${n} does not exist. Nothing deleted.`)
    return
  }
  
  if (args.length != 4) {
  errorLog("Error: Missing NUMBER for deleting todo.")
  return
  }

  if (isNaN(n)) {
    errorLog("please provide a valid number for complete command")
    return
  }

  db.get(`todos`)
    .remove(todo => todo.id == n-1)
    .write()
  console.log(`Deleted todo #${n}`)
  let Length = db.get('todos').value().length;
  while(Length >= n)
  {
    db.get('todos')
    .find({id : Length  })
    .assign({ id: Length - 1})
    .write()
    Length--;
  }
}

function completeTodo() {
  if(!args[3]){
    errorLog("Error: Missing NUMBER for marking todo as done.")
    return
  }
  else if(args[3] == 0){
    errorLog("Error: todo #0 does not exist.")
    return
  }
  else if(args.length != 4) {
    errorLog("invalid number of arguments passed for complete command")
    return
  }

  let n = Number(args[3])
  if (isNaN(n)) {
    errorLog("please provide a valid number for complete command")
    return
  }

  let todosLength = db.get('todos').value().length
  if (n > todosLength) {
    errorLog("invalid number passed for complete command.")
    return
  }

  db.set(`todos[${n-1}].complete`, true).write()
  countCompleted++;
  db.get('todos')
  .remove(todo => todo.complete == 1)
  .write()
  console.log(`Marked todo #${n} as done.`)
  let Length = db.get('todos').value().length;
  while(Length >= n)
  {
    db.get('todos')
    .find({id : Length  })
    .assign({ id: Length - 1})
    .write()
    Length--;
  }
  
}

switch(args[2]) {
  case 'help':
    usageFunction()
    break
  case 'add':
    newTodo()
    break
  case 'ls':
    getTodos()
    break
  case 'done':
    completeTodo()
    break
  case 'del':
    deleteTodo()
    break
  case 'report':
    reportTodo()
    break
  default:
    usageFunction()
}
