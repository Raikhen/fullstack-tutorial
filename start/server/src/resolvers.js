const { paginateResults } = require('./utils')

module.exports = {
  Query: {
    async launches(root, args, ctx, info) {
      const { launchAPI } = ctx.dataSources
      const { pageSize = 20, after } = args

      const allLaunches = await launchAPI.getAllLaunches()
      allLaunches.reverse()

      const launches = paginateResults({
        after,
        pageSize,
        results: allLaunches
      })

      const lastCursor = launches[launches.length - 1].cursor
      const lastOfAllCursors = allLaunches[allLaunches.length - 1].cursor

      return {
        launches,
        cursor: launches.length ? lastCursor : null,
        hasMore: launches.length ? lastCursor !== lastOfAllCursors : false
      }
    },
    launch(root, args, ctx, info) {
      const { launchAPI } = ctx.dataSources
      const { id } = args
      return launchAPI.getLaunchById({ launchId: id })
    },
    async me(root, args, ctx, info) {
      const { userAPI } = ctx.dataSources
      return userAPI.findOrCreateUser()
    }
  },
  Mutation: {
    async login(root, args, ctx, info) {
      const { userAPI } = ctx.dataSources
      const { email } = args
      const user = await userAPI.findOrCreateUser({ email })
      if (user) return new Buffer(email).toString('base64')
    },
    async bookTrips(root, args, ctx, info) {
      const { userAPI, launchAPI } = ctx.dataSources
      const { launchIds } = args

      const results = await userAPI.bookTrips({ launchIds })
      const launches = await launchAPI.getLaunchesByIds({ launchIds })

      let message

      if (results.length === launchIds.length) {
        message = 'Trips booked successfully!'
      } else {
        const notBooked = launchIds.filter(id => !results.includes(id))
        message = `The following launches couldn't be booked: ${notBooked}.`
      }

      return {
        message,
        launches,
        success: results && results.length === launchIds.length
      }
    },
    async cancelTrip(root, args, ctx, info) {
      const { userAPI, launchAPI } = ctx.dataSources
      const { launchId } = args
      const result = userAPI.cancelTrip({ launchId })

      if (!result) {
        return {
          success: false,
          message: 'Failed to cancel trip...',

        }
      }

      const launch = await launchAPI.getLaunchById({ launchId })

      return {
        success: true,
        message: 'Trip cancelled!',
        launches: [launch]
      }
    }
  },
  Launch: {
    async isBooked(root, args, ctx, info) {
      const { userAPI } = ctx.dataSources
      return userAPI.isBookedOnLaunch({ launchId: root.id })
    }
  },
  User: {
    async trips(root, args, ctx, info) {
      const { userAPI, launchAPI } = ctx.dataSources
      const launchIds = await userAPI.getLaunchIdsByUser()

      if (!launchIds.length) return []

      return launchAPI.getLaunchesByIds({ launchIds }) || []
    }
  },
  Mission: {
    missionPatch(root, args, ctx, info) {
      const { size } = args
      const { missionPatchSmall, missionPatchLarge } = root
      return size === 'SMALL' ? missionPatchSmall : missionPatchLarge
    }
  }
}
