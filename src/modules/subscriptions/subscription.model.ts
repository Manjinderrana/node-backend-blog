import mongoose from "mongoose"
import { ISubscription } from "./subscription.interface"

const subscriptionSchema = new mongoose.Schema<ISubscription>({
    subscribedId: {
        type: mongoose.Types.ObjectId,  // id of channel to who is subscribing
        ref: "users"
    },
    subscriberId: {
        type: mongoose.Types.ObjectId,   // who is subscribing
        ref: "users"
    },
})

subscriptionSchema.index({ subscribedId: 1, channel: 1 }, { unique: true });

const Subscription = mongoose.model<ISubscription>("Subscription",subscriptionSchema)

export default Subscription

