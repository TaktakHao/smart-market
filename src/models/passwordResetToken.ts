import { Schema, model, Document } from "mongoose";
import { hash, compare, genSalt } from "bcrypt";

interface PasswordResetTokenDocument extends Document {
    owner: Schema.Types.ObjectId,
    token: string,
    createAt: Date
}

interface Methods {
    compareToken(token: string): Promise<boolean>
}

const resetTokenSchema = new Schema<PasswordResetTokenDocument, {}, Methods>({
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
        expires: 3600,
        default: Date.now()
    }
})

resetTokenSchema.pre("save", async function (next) {
    if (this.isModified("token")) {
        const salt = await genSalt(10);
        this.token = await hash(this.token, salt)
    }

    next();
})

resetTokenSchema.methods.compareToken = async function (token: string) {
    return await compare(token, this.token)
}

const PassResetModel = model('PasswordResetToken', resetTokenSchema)
export default PassResetModel