import { Collection, MongoClient, MongoClientOptions, ReadPreference } from "mongodb";
import { node_env } from "./env.load";

let mongo: MongoClient

type TPairPrice = {
    id: number;
    price: number;
    decimal: number;
    created_at: Date
}

let collections: {
    pair_prices: Collection<TPairPrice>,
} = new Object() as any

const COLLECTION_NAMES = {
    pair_prices: "pair_prices",
}

const checkModelInDb = async (params: { schema: any, collection: Collection<any> }[]) => {
    try {
        for (let param of params) {
            const { collection, schema } = param
            console.log(`checking in collection ${collection.collectionName} ...`)
            const notPassSchemaItems = await collection.find({ $nor: [{ $jsonSchema: schema }] }).toArray()
            if (notPassSchemaItems.length > 0) throw new Error(`${collection.collectionName} collection has ${notPassSchemaItems.length} item(s) not pass schema`)
        }
    } catch (e) {
        throw e
    }
}


const connectMongo = async (uri: string = node_env.mongodb_uri, db_name: string = node_env.mongodb_db_name) => {
    try {
        console.log(`mongodb: connecting ...`)
        const mongo_options: MongoClientOptions = {
            ignoreUndefined: true, // find: {xxx: {$exists: false}}
            readPreference: ReadPreference.PRIMARY,
        }
        mongo = await new MongoClient(uri, mongo_options).connect()

        mongo.on('error', async (e) => {
            try {
                console.log(e)
                await mongo.close()
                await connectMongo(uri, db_name)
            } catch (e) {
                setTimeout(() => connectMongo(uri, db_name), 1000)
                throw e
            }
        })

        mongo.on('timeout', async () => {
            try {
                await mongo.close()
                await connectMongo(uri, db_name)
            } catch (e) {
                setTimeout(() => connectMongo(uri, db_name), 1000)
                throw e
            }
        })

        mongo.on('close', async () => {
            try {
                await connectMongo(uri, db_name)
            } catch (e) {
                setTimeout(() => connectMongo(uri, db_name), 1000)
                throw e
            }
        })

        const db = db_name ? mongo.db(db_name) : mongo.db()
        Object.keys(COLLECTION_NAMES).forEach((name) => {
            collections[COLLECTION_NAMES[name]] = db.collection(COLLECTION_NAMES[name])
        })

        console.log(`🚀 mongodb: connected to ${db.databaseName}`)
    } catch (e) {
        console.log(`mongodb: disconnected`)
        await mongo?.close(true)
        setTimeout(connectMongo, 1000)
        throw e
    }
}



const mongoCheckModel = async () => {
    try {
        console.log(`mongodb: checking model and document schema ...`)
        await checkModelInDb([

        ])
    } catch (e) {
        throw e
    }
}



export {
    COLLECTION_NAMES, collections, connectMongo, mongo, mongoCheckModel
};
