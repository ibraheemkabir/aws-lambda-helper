require('@oclif/command').run()
.then(require('@oclif/command/flush'))
// @ts-ignore
.catch(require('@oclif/errors/handle'))
