from bson import ObjectId
from pymongo.database import Database

# collection
# GET (all objects as a list)
def read_all(db, collection_name, owner):
    collection = db[collection_name]
    return list(collection.find({'owner_id' : owner}, {'_id': False, 'owner_id' : False}))

# GET (specific object)
def read_uuid(db : Database, collection_name, uuId):
    collection = db[collection_name]
    return collection.find_one({'_id': ObjectId(uuId)}, {'_id': False})

##Read by key:value

def read(db : Database, collection_name : str, key : str, value):
    collection = db[collection_name]
    return collection.find_one({ key : value })

# PUT
def update(db: Database, collection_name, uuId, json_data):
    return db[collection_name].replace_one({"_id": ObjectId(uuId)}, json_data)

##Add a new field to an existing document (AsSessionWithQoS / QoSMonitoring)
def update_new_field(db: Database, collection_name, uuId, json_data):
    return db[collection_name].update_one({'_id': ObjectId(uuId)} , { '$set' : json_data})

# POST
def create(db: Database, collection_name, json_data):
    return db[collection_name].insert_one(json_data)

# DELETE
def delete(db: Database, collection_name, uuId):
    result = db[collection_name].delete_one({"_id": ObjectId(uuId)})
    return result

#Read all profiles by gNB id (QoSProfile)

def read_all_gNB_profiles(db : Database, collection_name, id):
    collection = db[collection_name]
    return list(collection.find({'gNB_id': id}, {'_id': False}))

#Read by gNB/profile (QoSProfile)

def read_gNB_qosprofile(db : Database, collection_name, gNB_id, qos_id):
    collection = db[collection_name]
    return collection.find_one({'gNB_id': gNB_id, 'value' : qos_id}, {'_id': False})

