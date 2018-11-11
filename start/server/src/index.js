const isEmail = require('isemail')
const { ApolloServer } = require('apollo-server')

const typeDefs = require('./schema')
const resolvers = require('./resolvers')
const UserAPI = require('./datasources/user')
const LaunchAPI = require('./datasources/launch')
const { createStore } = require('./utils')

const store = createStore()

const server = new ApolloServer({
  typeDefs,
  resolvers,
  async context({ req }) {
    const auth = (req.headers && req.headers.authorization) || ''
    const email = new Buffer(auth, 'base64').toString('ascii')

    if (!isEmail.validate(email)) return { user: null }

    const users = await store.users.findOrCreate({ where: { email } })
    const user = users && users[0] ? users[0] : null
    return { user: { ...user.dataValues } }
  },
  dataSources() {
    return {
      launchAPI: new LaunchAPI(),
      userAPI: new UserAPI({ store })
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})
