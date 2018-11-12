import React              from 'react'
import ReactDOM           from 'react-dom'
import gql                from 'graphql-tag'
import { ApolloProvider } from 'react-apollo'
import { ApolloClient }   from 'apollo-client'
import { HttpLink }       from 'apollo-link-http'
import { InMemoryCache }  from 'apollo-cache-inmemory'

import Pages              from './pages'

const getLaunchQuery = gql`
  query GetLaunch {
    launch(id: 56) {
      id
      mission {
        name
      }
    }
  }
`

const client = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:4000' }),
  cache: new InMemoryCache()
})

ReactDOM.render(
  <ApolloProvider client={client}>
    <Pages />
  </ApolloProvider>,
  document.getElementById('root')
)
