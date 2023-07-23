import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/auth/schema/user.schema';

@Schema({
    timestamps: true,
})

export class Product {
    @Prop()
    name: string

    @Prop()
    amount: string
    
    @Prop()
    desctiption: string

    @Prop({
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    })
    user: User;
}

export const productSchema = SchemaFactory.createForClass(Product);