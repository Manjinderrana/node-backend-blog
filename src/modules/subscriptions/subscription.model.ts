import mongoose from 'mongoose'
import { ISubscription } from './subscription.interface'

const subscriptionSchema = new mongoose.Schema<ISubscription>({
  subscribedToId: {
    type: mongoose.Types.ObjectId, // id of channel to whom is subscribing
    ref: 'users',
  },
  subscriberId: {
    type: mongoose.Types.ObjectId, // who is subscribing
    ref: 'users',
  },
})

const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema)

export default Subscription
