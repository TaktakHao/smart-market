import { Schema, model, Document } from "mongoose";
import { hash, compare, genSalt } from "bcrypt";

interface UserDocument extends Document {
    name: string,
    password: string,
    email: string,
    verified: boolean,
    tokens: string[]
}

interface Methods {
    comparePassword(password: string): Promise<boolean>
}

const userSchema = new Schema<UserDocument, {}, Methods>({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    tokens: {
        type: [String]
    }
},
    { timestamps: true }
)

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        const salt = await genSalt(10);
        this.password = await hash(this.password, salt)
    }

    next();
})

userSchema.methods.comparePassword = async function (password) {
    return await compare(password, this.password)
}

const UserModel = model("User", userSchema)
export default UserModel