import { Schema, model, Document } from "mongoose";
import { hash, compare, genSalt } from "bcrypt";

interface AuthTokenDocument extends Document {
    owner: Schema.Types.ObjectId,
    token: string,
    createAt: Date
}

interface Methods {
    compareToken(token: string): Promise<boolean>
}

const authTokenSchema = new Schema<AuthTokenDocument, {}, Methods>({
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    createAt: {
        type: Date,
        expires: 86400,
        default: Date.now()
    }
})

authTokenSchema.pre("save", async function (next) {
    if (this.isModified("token")) {
        const salt = await genSalt(10);
        this.token = await hash(this.token, salt)
    }

    next();
})

authTokenSchema.methods.compareToken = async function (token: string) {
    return await compare(token, this.token)
}

const AuthTokenModel = model('AuthToken', authTokenSchema)
export default AuthTokenModel