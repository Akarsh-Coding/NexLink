import mongoose from "mongoose";

const connectionRequest = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    connectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    status: {
        type: Boolean,
        default: null,
    },
});

const ConnectionRequest = mongoose.model("connectionRequest", connectionRequest);

export default ConnectionRequest;